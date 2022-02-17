import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { UserPersistence } from '@iota-is/shared-modules/lib/models/types/user';

const collectionName = CollectionNames.users;

export const getUserByUsername = async (username: string): Promise<UserPersistence> => {
	const query = { username };
	return await MongoDbService.getDocument<UserPersistence>(collectionName, query);
};
