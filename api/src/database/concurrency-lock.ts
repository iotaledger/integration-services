import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, WithId, DeleteWriteOpResultObject } from 'mongodb';

const collectionName = CollectionNames.concurrencyLocks;
const getIndex = (id: string, lock: string) => `${id}-${lock}`;

export const getLock = async (id: string, lock: string): Promise<{ id: string; lock: string; created: Date } | null> => {
	const query = { _id: getIndex(id, lock) };
	return MongoDbService.getDocument<{ id: string; lock: string; created: Date }>(collectionName, query);
};

export const insertLock = async (id: string, lock: string): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
	const document = {
		_id: getIndex(id, lock),
		id,
		lock,
		created: new Date()
	};

	const res = await MongoDbService.insertDocument<{ id: string; lock: string; created: Date }>(collectionName, document);
	if (!res.result.n) {
		throw new Error('could not add the lock!');
	}
	return res;
};

export const removeLock = async (id: string, lock: string): Promise<DeleteWriteOpResultObject> => {
	const query = { _id: getIndex(id, lock) };
	return MongoDbService.removeDocument(collectionName, query);
};
