import { User, UserSearch } from '../models/data/user';
import * as userDb from '../database/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';

export class UserService {
  async searchUsers(userSearch: UserSearch): Promise<User[]> {
    return userDb.searchUsers(userSearch);
  }

  async getUser(userId: string): Promise<User> {
    return userDb.getUser(userId);
  }

  async getUserByUsername(username: string): Promise<User> {
    return userDb.getUserByUsername(username);
  }

  async addUser(user: User): Promise<InsertOneWriteOpResult<WithId<unknown>>> {
    return userDb.addUser(user);
  }

  async updateUser(user: User): Promise<UpdateWriteOpResult> {
    return userDb.updateUser(user);
  }

  async deleteUser(userId: string): Promise<DeleteWriteOpResultObject> {
    return userDb.deleteUser(userId);
  }
}
