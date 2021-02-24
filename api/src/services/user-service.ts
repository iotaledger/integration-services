import { User } from '../models/data/user';
import * as userDb from '../database/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';

export const getUser = async (userId: string): Promise<User> => {
  return userDb.getUser(userId);
};

export const addUser = async (user: User): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  return userDb.addUser(user);
};

export const updateUser = async (user: User): Promise<UpdateWriteOpResult> => {
  return userDb.updateUser(user);
};

export const deleteUser = async (userId: string): Promise<DeleteWriteOpResultObject> => {
  return userDb.deleteUser(userId);
};
