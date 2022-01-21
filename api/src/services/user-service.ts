import { User, UserPersistence, UserRoles, UserSearch } from '@iota-is/shared-modules/src/models/types/user';
import * as userDb from '../database/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';
import { getDateFromString, getDateStringFromDate } from '../utils/date';
import isEmpty from 'lodash/isEmpty';
import {
	CreateIdentityBody,
	IdentityJson,
	VerifiableCredentialJson,
	IdentityKeys
} from '@iota-is/shared-modules/src/models/types/identity';
import { SchemaValidator } from '../utils/validator';
import * as IdentityDocsDb from '../database/identity-keys';
import { SsiService } from './ssi-service';
import { ILogger } from '../utils/logger';

export class UserService {
	constructor(private readonly ssiService: SsiService, private readonly serverSecret: string, private readonly logger: ILogger) {}

	async searchUsers(userSearch: UserSearch): Promise<User[]> {
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
					claim: undefined
				};
			})
			.filter((u) => u);
	}

	async createIdentity(createIdentityBody: CreateIdentityBody): Promise<IdentityJson> {
		const identity = await this.ssiService.createIdentity();
		const user: User = {
			...createIdentityBody,
			id: identity.doc.id.toString(),
			publicKey: identity.key.public
		};

		await this.addUser(user);

		if (createIdentityBody.storeIdentity && this.serverSecret) {
			const identityKeys: IdentityKeys = {
				id: identity.doc.id,
				key: identity.key
			};
			await IdentityDocsDb.saveIdentityKeys(identityKeys, this.serverSecret);
		}

		return {
			...identity
		};
	}

	async getUser(id: string, isAuthorizedUser?: boolean): Promise<User | null> {
		const userPersistence = await userDb.getUser(id);
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
	}

	async getIdentityId(username: string): Promise<string> {
		const userPersistence = await userDb.getUserByUsername(username);
		const user = this.getUserObject(userPersistence);
		return user?.id;
	}

	async addUser(user: User): Promise<InsertOneWriteOpResult<WithId<unknown>>> {
		if (!this.hasValidFields(user)) {
			throw new Error('no valid body provided!');
		}
		const validator = SchemaValidator.getInstance(this.logger);
		validator.validateUser(user);

		const identityDoc = await this.ssiService.getLatestIdentityDoc(user.id);
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
	}

	async updateUser(user: User): Promise<UpdateWriteOpResult> {
		const userPersistence = this.getUserPersistence(user);
		return userDb.updateUser(userPersistence);
	}

	async addUserVC(vc: VerifiableCredentialJson): Promise<void> {
		await userDb.addUserVC(vc);
	}

	async removeUserVC(vc: VerifiableCredentialJson): Promise<UserPersistence> {
		return userDb.removeUserVC(vc);
	}

	async deleteUser(id: string): Promise<DeleteWriteOpResultObject> {
		return userDb.deleteUser(id);
	}

	private hasValidFields(user: User): boolean {
		return !(!user.publicKey && !user.id);
	}

	private getUserPersistence(user: User): UserPersistence | null {
		if (user == null || isEmpty(user.id)) {
			throw new Error('Error when parsing the body: id must be provided!');
		}
		const { publicKey, id, username, registrationDate, claim, verifiableCredentials, role, isPrivate, isServerIdentity } = user;

		const userPersistence: UserPersistence = {
			id,
			publicKey,
			username,
			registrationDate: registrationDate && getDateFromString(registrationDate),
			claim,
			verifiableCredentials,
			role: role && (role as UserRoles),
			isPrivate,
			isServerIdentity
		};

		return userPersistence;
	}

	private getUserObject(userPersistence: UserPersistence): User | null {
		if (userPersistence == null || isEmpty(userPersistence.id)) {
			return null;
		}

		const { username, publicKey, id, registrationDate, claim, verifiableCredentials, role, isPrivate } = userPersistence;

		const user: User = {
			id,
			publicKey,
			username,
			registrationDate: getDateStringFromDate(registrationDate),
			claim,
			verifiableCredentials,
			role: role && (role as UserRoles),
			isPrivate
		};
		return user;
	}
}
