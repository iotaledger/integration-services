import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';

const collectionName = CollectionNames.auth;

export const getNonce = async (id: string): Promise<{ id: string; nonce: string }> => {
	const query = { _id: id };
	return await MongoDbService.getDocument<{ id: string; nonce: string }>(collectionName, query);
};

export const upsertNonce = async (id: string, nonce: string) => {
	const query = { _id: id };
	const update = {
		$set: { _id: id, id, nonce }
	};

	const res = await MongoDbService.updateDocument(collectionName, query, update, { upsert: true });
	if (!res?.result?.n) {
		throw new Error('could not add or update the message to sign!');
	}
};
