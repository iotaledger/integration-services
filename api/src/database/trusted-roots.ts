import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';

const collectionName = CollectionNames.trustedRoots;

export const getTrustedRootIds = async (): Promise<{ userId: string }[]> => {
	const query = {};
	return await MongoDbService.getDocuments<{ userId: string }>(collectionName, query);
};

export const addTrustedRootId = async (userId: string) => {
	const document = {
		_id: userId,
		userId,
		creationDate: new Date()
	};

	const res = await MongoDbService.insertDocument(collectionName, document);
	if (!res?.result.n) {
		throw new Error('could not add the trusted root!');
	}
};

export const deleteTrustedRootId = async (userId: string) => {
	const query = { _id: userId };
	return MongoDbService.removeDocument(collectionName, query);
};
