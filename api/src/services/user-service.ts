import { User, UserPersistence, UserRoles, UserSearch } from '../models/types/user';
import * as userDb from '../database/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';
import { getDateFromString, getDateStringFromDate } from '../utils/date';
import isEmpty from 'lodash/isEmpty';
import { CreateIdentityBody, IdentityJsonUpdate, VerifiableCredentialJson } from '../models/types/identity';
import { SchemaValidator } from '../utils/validator';
import * as IdentityDocsDb from '../database/identity-docs';
import { SsiService } from './ssi-service';
import { ILogger } from '../utils/logger';

export class UserService {
	constructor(private readonly ssiService: SsiService, private readonly serverSecret: string, private readonly logger: ILogger) {}

	searchUsers = async (userSearch: UserSearch): Promise<User[]> => {
		const usersPersistence = await userDb.searchUsers(userSearch);
		return usersPersistence
			.map((user) => {
				const userObj = this.getUserObject(user);
				if (!userObj) {
					return null;
				}
				return {
					...userObj,
					verifiableCredentials: undefined,
					claim: userObj.isPrivate ? undefined : userObj.claim
				};
			})
			.filter((u) => u);
	};

	createIdentity = async (createIdentityBody: CreateIdentityBody): Promise<IdentityJsonUpdate> => {
		const identity = await this.ssiService.createIdentity();
		const user: User = {
			...createIdentityBody,
			identityId: identity.doc.id.toString(),
			publicKey: identity.key.public
		};

		await this.addUser(user);

		if (createIdentityBody.storeIdentity && this.serverSecret) {
			await IdentityDocsDb.saveIdentity(identity, this.serverSecret);
		}

		return {
			...identity
		};
	};

	getUser = async (identityId: string, isAuthorizedUser?: boolean): Promise<User | null> => {
		const userPersistence = await userDb.getUser(identityId);
		const user = userPersistence && this.getUserObject(userPersistence);
		const privateUserInfo: boolean = user?.isPrivate && !isAuthorizedUser;

		if (!user) {
			return null;
		}

		return {
			...user,
			claim: !privateUserInfo ? user.claim : undefined,
			verifiableCredentials: !privateUserInfo ? user.verifiableCredentials : undefined
		};
	};

	getUsersByIds = async (identityIds: string[]): Promise<User[] | null> => {
		const usersPersistence = await userDb.getUsersByIds(identityIds);
		if (!usersPersistence) {
			return null;
		}
		return usersPersistence.map((userP: UserPersistence) => this.getUserObject(userP));
	};

	getUserByUsername = async (username: string): Promise<User> => {
		const userPersistence = await userDb.getUserByUsername(username);
		return this.getUserObject(userPersistence);
	};

	addUser = async (user: User): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
		if (!this.hasValidFields(user)) {
			throw new Error('no valid body provided!');
		}
		const validator = SchemaValidator.getInstance(this.logger);
		validator.validateUser(user);

		const identityDoc = await this.ssiService.getLatestIdentityDoc(user.identityId);
		const publicKey = this.ssiService.getPublicKey(identityDoc);
		if (!publicKey || !user.publicKey || publicKey !== user.publicKey) {
			throw new Error('wrong identity provided');
		}

		const userPersistence = this.getUserPersistence(user);
		const res = await userDb.addUser(userPersistence);
		if (!res?.result?.n) {
			throw new Error('could not create user identity!');
		}
		return res;
	};

	updateUser = async (user: User): Promise<UpdateWriteOpResult> => {
		const userPersistence = this.getUserPersistence(user);
		return userDb.updateUser(userPersistence);
	};

	addUserVC = async (vc: VerifiableCredentialJson): Promise<void> => {
		await userDb.addUserVC(vc);
	};

	removeUserVC = async (vc: VerifiableCredentialJson): Promise<UserPersistence> => {
		return userDb.removeUserVC(vc);
	};

	deleteUser = async (identityId: string): Promise<DeleteWriteOpResultObject> => {
		return userDb.deleteUser(identityId);
	};

	private hasValidFields = (user: User): boolean => {
		return !(!user.publicKey && !user.identityId);
	};

	private getUserPersistence = (user: User): UserPersistence | null => {
		if (user == null || isEmpty(user.identityId)) {
			throw new Error('Error when parsing the body: identityId must be provided!');
		}
		const { publicKey, identityId, username, registrationDate, claim, verifiableCredentials, role, isPrivate } = user;

		const userPersistence: UserPersistence = {
			identityId,
			publicKey,
			username,
			registrationDate: registrationDate && getDateFromString(registrationDate),
			claim,
			verifiableCredentials,
			role: role && (role as UserRoles),
			isPrivate
		};

		return userPersistence;
	};

	private getUserObject = (userPersistence: UserPersistence): User | null => {
		if (userPersistence == null || isEmpty(userPersistence.identityId)) {
			return null;
		}

		const { username, publicKey, identityId, registrationDate, claim, verifiableCredentials, role, isPrivate } = userPersistence;

		const user: User = {
			identityId,
			publicKey,
			username,
			registrationDate: getDateStringFromDate(registrationDate),
			claim,
			verifiableCredentials,
			role: role && (role as UserRoles),
			isPrivate
		};
		return user;
	};
}
