import {
  User,
  UserClassification,
  UserPersistence,
  UserSearch,
  Verification,
  VerificationPersistence,
  VerificationUpdatePersistence
} from '../models/data/user';
import * as userDb from '../database/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';
import { getDateFromString, getDateStringFromDate } from '../utils/date';
import isEmpty from 'lodash/isEmpty';

export class UserService {
  searchUsers = async (userSearch: UserSearch): Promise<User[]> => {
    const usersPersistence = await userDb.searchUsers(userSearch);
    return usersPersistence.map((user) => this.getUserObject(user));
  };

  getUser = async (userId: string): Promise<User | null> => {
    const userPersistence = await userDb.getUser(userId);
    return this.getUserObject(userPersistence);
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
    const {
      firstName,
      lastName,
      publicKey,
      subscribedChannelIds,
      userId,
      username,
      verification,
      organization,
      registrationDate,
      classification,
      description
    } = user;

    if (classification !== UserClassification.human && classification !== UserClassification.device && classification !== UserClassification.api) {
      throw new Error(
        `No valid classification provided, it must be ${UserClassification.human}, ${UserClassification.device} or ${UserClassification.api}!`
      );
    }

    const userPersistence: UserPersistence = {
      userId,
      publicKey,
      username,
      classification: classification as UserClassification,
      subscribedChannelIds,
      firstName,
      lastName,
      description,
      organization,
      registrationDate: registrationDate && getDateFromString(registrationDate),
      verification: this.getVerificationPersistence(verification)
    };

    return userPersistence;
  };

  private getUserObject = (userPersistence: UserPersistence): User | null => {
    if (userPersistence == null || isEmpty(userPersistence.userId)) {
      console.error(`Error when parsing the body, no user id found on persistence model with username ${userPersistence?.username}`);
      return null;
    }

    const {
      firstName,
      username,
      publicKey,
      userId,
      subscribedChannelIds,
      organization,
      lastName,
      registrationDate,
      verification,
      classification,
      description
    } = userPersistence;

    const user: User = {
      userId,
      publicKey,
      username,
      classification,
      subscribedChannelIds,
      firstName,
      lastName,
      description,
      registrationDate: getDateStringFromDate(registrationDate),
      verification: this.getVerificationObject(verification),
      organization
    };
    return user;
  };
}
