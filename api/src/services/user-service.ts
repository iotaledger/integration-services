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

export class UserService {
	searchUsers = async (userSearch: UserSearch): Promise<User[]> => {
		const usersPersistence = await userDb.searchUsers(userSearch);
		return usersPersistence.map((user) => this.getUserObject(user));
	};

	getUser = async (userId: string): Promise<User | null> => {
		const userPersistence = await userDb.getUser(userId);
		return this.getUserObject(userPersistence);
	};

	getUsersByIds = async (userIds: string[]): Promise<User[] | null> => {
		const usersPersistence = await userDb.getUsersByIds(userIds);
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

	deleteUser = async (userId: string): Promise<DeleteWriteOpResultObject> => {
		return userDb.deleteUser(userId);
	};

	private hasValidFields = (user: User): boolean => {
		return !(!user.publicKey && !user.userId);
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
		if (user == null || isEmpty(user.userId)) {
			throw new Error('Error when parsing the body: userId must be provided!');
		}
		const { publicKey, userId, username, verification, organization, registrationDate, type, data, verifiableCredentials, role } = user;

		const userPersistence: UserPersistence = {
			userId,
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
		if (userPersistence == null || isEmpty(userPersistence.userId)) {
			console.error(`Error when parsing the body, no user id found on persistence model with username ${userPersistence?.username}`);
			return null;
		}

		const { username, publicKey, userId, organization, registrationDate, verification, type, data, verifiableCredentials, role } = userPersistence;

		const user: User = {
			userId,
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
