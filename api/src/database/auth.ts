import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';

const collectionName = CollectionNames.auth;

export const getNonce = async (identityId: string): Promise<{ identityId: string; nonce: string }> => {
	const query = { _id: identityId };
	return await MongoDbService.getDocument<{ identityId: string; nonce: string }>(collectionName, query);
};

export const upsertNonce = async (identityId: string, nonce: string) => {
	const query = { _id: identityId };
	const update = {
		$set: { _id: identityId, identityId, nonce }
	};

	const res = await MongoDbService.updateDocument(collectionName, query, update, { upsert: true });
	if (!res?.result?.n) {
		throw new Error('could not add or update the message to sign!');
	}
};
