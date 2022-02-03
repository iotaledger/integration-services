import { CollectionNames } from './constants';
import { MongoDbService } from '@iota-is/shared-modules/lib/services/mongodb-service';

const collectionName = CollectionNames.trustedRoots;

export const getTrustedRootIds = async (): Promise<{ id: string }[]> => {
	const query = {};
	return await MongoDbService.getDocuments<{ id: string }>(collectionName, query);
};

export const addTrustedRootId = async (id: string) => {
	const document = {
		_id: id,
		id,
		created: new Date()
	};

	const res = await MongoDbService.insertDocument(collectionName, document);
	if (!res?.result.n) {
		throw new Error('could not add the trusted root from the db');
	}
};

export const removeTrustedRootId = async (id: string) => {
	const query = { _id: id };
	const res = await MongoDbService.removeDocument(collectionName, query);
	if (!res?.result.n) {
		throw new Error('could not remove the trusted root from the db');
	}
};
