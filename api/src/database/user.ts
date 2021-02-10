import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { User } from '../models/data/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';

const collectionName = CollectionNames.users;

export const getUser = async (userId: string): Promise<User> => {
  const query = { _id: userId };
  return await MongoDbService.getDocument<User>(collectionName, query);
};

export const addUser = async (user: User): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  const document = {
    _id: user.userId,
    ...user
  };

  return MongoDbService.insertDocument(collectionName, document);
};

export const updateUser = async (user: User): Promise<UpdateWriteOpResult> => {
  const query = {
    _id: user.userId
  };

  const update = {
    $set: {}
  };

  return MongoDbService.upsertDocument(collectionName, query, update);
};

export const deleteUser = async (userId: string): Promise<DeleteWriteOpResultObject> => {
  const query = { _id: userId };
  return MongoDbService.removeDocument(collectionName, query);
};
