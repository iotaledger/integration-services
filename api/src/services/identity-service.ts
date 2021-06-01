import {
	User,
	UserPersistence,
	UserRoles,
	UserSearch,
	Verification,
	VerificationPersistence,
	VerificationUpdatePersistence
} from '../models/types/user';
import * as userDb from '../database/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';
import { getDateFromString, getDateStringFromDate } from '../utils/date';
import isEmpty from 'lodash/isEmpty';
import { VerifiableCredentialJson } from '../models/types/identity';
import { SchemaValidator } from '../utils/validator';

export class IdentityService {
	searchUsers = async (userSearch: UserSearch): Promise<User[]> => {
		const usersPersistence = await userDb.searchUsers(userSearch);
		return usersPersistence.map((user) => this.getUserObject(user));
	};

	getUser = async (identityId: string): Promise<User | null> => {
		const userPersistence = await userDb.getUser(identityId);
		return this.getUserObject(userPersistence);
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
		const validator = SchemaValidator.getInstance();
		validator.validateUser(user);

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

	updateUserVerification = async (vup: VerificationUpdatePersistence): Promise<void> => {
		await userDb.updateUserVerification(vup);
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

	private getVerificationPersistence = (verification: Verification): VerificationPersistence | null => {
		return (
			verification && {
				verificationDate: verification.verificationDate && getDateFromString(verification.verificationDate),
				lastTimeChecked: verification.lastTimeChecked && getDateFromString(verification.lastTimeChecked),
				verified: verification.verified,
				verificationIssuerId: verification.verificationIssuerId
			}
		);
	};

	private getVerificationObject = (verificationPersistence: VerificationPersistence): Verification | null => {
		return (
			verificationPersistence && {
				verified: verificationPersistence.verified,
				verificationDate: getDateStringFromDate(verificationPersistence.verificationDate),
				lastTimeChecked: getDateStringFromDate(verificationPersistence.lastTimeChecked),
				verificationIssuerId: verificationPersistence.verificationIssuerId
			}
		);
	};

	private getUserPersistence = (user: User): UserPersistence | null => {
		if (user == null || isEmpty(user.identityId)) {
			throw new Error('Error when parsing the body: identityId must be provided!');
		}
		const { publicKey, identityId, username, verification, organization, registrationDate, type, data, verifiableCredentials, role } = user;

		const userPersistence: UserPersistence = {
			identityId,
			publicKey,
			username,
			type,
			organization,
			registrationDate: registrationDate && getDateFromString(registrationDate),
			verification: this.getVerificationPersistence(verification),
			data,
			verifiableCredentials,
			role: role && (role as UserRoles)
		};

		return userPersistence;
	};

	private getUserObject = (userPersistence: UserPersistence): User | null => {
		if (userPersistence == null || isEmpty(userPersistence.identityId)) {
			console.error(`Error when parsing the body, no user id found on persistence model with username ${userPersistence?.username}`);
			return null;
		}

		const {
			username,
			publicKey,
			identityId,
			organization,
			registrationDate,
			verification,
			type,
			data,
			verifiableCredentials,
			role
		} = userPersistence;

		const user: User = {
			identityId,
			publicKey,
			username,
			type,
			registrationDate: getDateStringFromDate(registrationDate),
			verification: this.getVerificationObject(verification),
			organization,
			data,
			verifiableCredentials,
			role: role && (role as UserRoles)
		};
		return user;
	};
}
