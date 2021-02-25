import { UserPersistence, UserSearch } from '../models/data/user';
import * as userDb from '../database/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';

export class UserService {
  searchUsers = (userSearch: UserSearch): Promise<UserPersistence[]> => {
    return userDb.searchUsers(userSearch);
  };

  getUser = (userId: string): Promise<UserPersistence> => {
    return userDb.getUser(userId);
  };

  getUserByUsername = (username: string): Promise<UserPersistence> => {
    return userDb.getUserByUsername(username);
  };

  addUser = (user: UserPersistence): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
    return userDb.addUser(user);
  };

  updateUser = (user: UserPersistence): Promise<UpdateWriteOpResult> => {
    return userDb.updateUser(user);
  };

  deleteUser = (userId: string): Promise<DeleteWriteOpResultObject> => {
    return userDb.deleteUser(userId);
  };
}
