import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { UserPersistence, UserSearch } from '../models/data/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';

const collectionName = CollectionNames.users;

export const searchUsers = async (userSearch: UserSearch): Promise<UserPersistence[]> => {
  const regex = (text: string) => text && new RegExp(text, 'i');
  const { classification, organization, subscribedChannelIds, username, verified, index, registrationDate } = userSearch;
  const limit = userSearch.limit != null ? userSearch.limit : 100;
  const query = {
    registrationDate: registrationDate && { $gte: registrationDate },
    classification: regex(classification),
    organization: regex(organization),
    username: regex(username),
    'verification.verified': verified,
    subscribedChannelIds: subscribedChannelIds && { $in: subscribedChannelIds }
  };
  console.log('QUERY', query);

  const plainQuery = MongoDbService.getPlainObject(query);
  const skip = index > 0 ? (index - 1) * limit : 0;
  const options = { limit, skip };

  return await MongoDbService.getDocuments<UserPersistence>(collectionName, plainQuery, options);
};

export const getUser = async (userId: string): Promise<UserPersistence | null> => {
  const query = { _id: userId };
  return await MongoDbService.getDocument<UserPersistence>(collectionName, query);
};

export const getUserByUsername = async (username: string): Promise<UserPersistence> => {
  const query = { username };
  return await MongoDbService.getDocument<UserPersistence>(collectionName, query);
};

export const addUser = async (user: UserPersistence): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  delete user.verification;
  const document = {
    _id: user.userId,
    ...user,
    registrationDate: new Date()
  };

  return MongoDbService.insertDocument(collectionName, document);
};

export const updateUser = async (user: UserPersistence): Promise<UpdateWriteOpResult> => {
  const query = {
    _id: user.userId
  };

  const { firstName, lastName, username, organization, subscribedChannelIds, description, classification } = user;

  const updateObject = MongoDbService.getPlainObject({
    firstName,
    lastName,
    description,
    username: username || undefined, // username must not be ''
    classification: classification || undefined, // username must not be ''
    organization,
    subscribedChannelIds
  });

  const update = {
    $set: { ...updateObject }
  };

  return MongoDbService.updateDocument(collectionName, query, update);
};

export const deleteUser = async (userId: string): Promise<DeleteWriteOpResultObject> => {
  const query = { _id: userId };
  return MongoDbService.removeDocument(collectionName, query);
};
