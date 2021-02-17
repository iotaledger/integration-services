import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { User } from '../models/data/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';

const collectionName = CollectionNames.users;

export const getUser = async (userId: string): Promise<User> => {
  const query = { _id: userId };
  return await MongoDbService.getDocument<User>(collectionName, query);
};

export const getUserByUsername = async (username: string): Promise<User> => {
  const query = { username };
  return await MongoDbService.getDocument<User>(collectionName, query);
};

export const addUser = async (user: User): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  delete user.verification;
  const document = {
    _id: user.userId,
    ...user,
    registrationDate: new Date()
  };

  return MongoDbService.insertDocument(collectionName, document);
};

export const updateUser = async (user: User): Promise<UpdateWriteOpResult> => {
  const query = {
    _id: user.userId
  };

  const { firstName, lastName, username, organization, subscribedChannels, description, classification } = user;

  const updateObject = MongoDbService.getPlainObject({
    firstName,
    lastName,
    description,
    username: username || undefined, // username must not be ''
    classification: classification || undefined, // username must not be ''
    organization,
    subscribedChannels
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
