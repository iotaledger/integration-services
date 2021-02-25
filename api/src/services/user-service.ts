import { User, UserClassification, UserPersistence, UserSearch } from '../models/data/user';
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
      throw new Error('No valid body provided!');
    }
    const userPersistence = this.getUserPersistence(user);
    return userDb.addUser(userPersistence);
  };

  updateUser = async (user: User): Promise<UpdateWriteOpResult> => {
    const userPersistence = this.getUserPersistence(user);
    return userDb.updateUser(userPersistence);
  };

  deleteUser = async (userId: string): Promise<DeleteWriteOpResultObject> => {
    return userDb.deleteUser(userId);
  };

  hasValidFields = (user: User): boolean => {
    return !(!user.username || !user.userId);
  };

  getUserPersistence = (user: User): UserPersistence | null => {
    if (user == null || isEmpty(user.userId)) {
      throw new Error('Error when parsing the body: userId must be provided!');
    }
    const {
      firstName,
      lastName,
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
      username,
      classification: classification as UserClassification,
      subscribedChannelIds,
      firstName,
      lastName,
      description,
      organization,
      registrationDate: registrationDate && getDateFromString(registrationDate),
      verification: verification && {
        verificationDate: verification.verificationDate && getDateFromString(verification.verificationDate),
        verified: verification.verified,
        verificationIssuerId: verification.verificationIssuerId
      }
    };

    return userPersistence;
  };

  getUserObject = (userPersistence: UserPersistence): User | null => {
    if (userPersistence == null || isEmpty(userPersistence.userId)) {
      console.error(`Error when parsing the body, no user id found on persistence model with username ${userPersistence?.username}`);
      return null;
    }

    const {
      firstName,
      username,
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
      username,
      classification,
      subscribedChannelIds,
      firstName,
      lastName,
      description,
      registrationDate: getDateStringFromDate(registrationDate),
      verification: verification && {
        verified: verification.verified,
        verificationDate: getDateStringFromDate(verification.verificationDate),
        verificationIssuerId: verification.verificationIssuerId
      },
      organization
    };
    return user;
  };
}
