import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';

const collectionName = CollectionNames.auth;

export const getNonce = async (userId: string): Promise<{ userId: string; nonce: string }> => {
	const query = { _id: userId };
	return await MongoDbService.getDocument<{ userId: string; nonce: string }>(collectionName, query);
};

export const upsertNonce = async (userId: string, nonce: string) => {
	const query = { _id: userId };
	const update = {
		$set: { _id: userId, userId, nonce }
	};

	const res = await MongoDbService.updateDocument(collectionName, query, update, { upsert: true });
	if (!res?.result?.n) {
		throw new Error('could not add or update the message to sign!');
	}
};
