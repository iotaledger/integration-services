import { User } from '../models/data/user';
import * as userDb from '../database/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';

export const getUser = async (userId: string): Promise<User> => {
  return userDb.getUser(userId);
};

export const addUser = async (channelInfo: User): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  return userDb.addUser(channelInfo);
};

export const updateUser = async (channelInfo: User): Promise<UpdateWriteOpResult> => {
  return userDb.updateUser(channelInfo);
};

export const deleteUser = async (userId: string): Promise<DeleteWriteOpResultObject> => {
  return userDb.deleteUser(userId);
};
