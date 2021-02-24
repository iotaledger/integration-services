import { User, UserSearch } from '../models/data/user';
import * as userDb from '../database/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';

export class UserService {
  searchUsers = (userSearch: UserSearch): Promise<User[]> => {
    return userDb.searchUsers(userSearch);
  };

  getUser = (userId: string): Promise<User> => {
    return userDb.getUser(userId);
  };

  getUserByUsername = (username: string): Promise<User> => {
    return userDb.getUserByUsername(username);
  };

  addUser = (user: User): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
    return userDb.addUser(user);
  };

  updateUser = (user: User): Promise<UpdateWriteOpResult> => {
    return userDb.updateUser(user);
  };

  deleteUser = (userId: string): Promise<DeleteWriteOpResultObject> => {
    return userDb.deleteUser(userId);
  };
}
