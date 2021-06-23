import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';

const collectionName = CollectionNames.trustedRoots;

export const getTrustedRootIds = async (): Promise<{ identityId: string }[]> => {
	const query = {};
	return await MongoDbService.getDocuments<{ identityId: string }>(collectionName, query);
};

export const addTrustedRootId = async (identityId: string) => {
	const document = {
		_id: identityId,
		identityId,
		created: new Date()
	};

	const res = await MongoDbService.insertDocument(collectionName, document);
	if (!res?.result.n) {
		throw new Error('could not add the trusted root from the db');
	}
};

export const removeTrustedRootId = async (identityId: string) => {
	const query = { _id: identityId };
	const res = await MongoDbService.removeDocument(collectionName, query);
	if (!res?.result.n) {
		throw new Error('could not remove the trusted root from the db');
	}
};
