import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, WithId, DeleteWriteOpResultObject } from 'mongodb';
import { ConcurrencyLock } from '@iota-is/shared-modules/src/models/types/concurrency';

const collectionName = CollectionNames.concurrencyLocks;

export const getLock = async (lock: string): Promise<ConcurrencyLock | null> => {
	const query = { _id: lock };
	return MongoDbService.getDocument<ConcurrencyLock>(collectionName, query);
};

export const insertLock = async (lock: string): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
	const document = {
		_id: lock,
		lock,
		created: new Date()
	};

	const res = await MongoDbService.insertDocument<ConcurrencyLock>(collectionName, document);
	if (!res.result.n) {
		throw new Error('could not add the lock!');
	}
	return res;
};

export const removeLock = async (lock: string): Promise<DeleteWriteOpResultObject> => {
	const query = { _id: lock };
	return MongoDbService.removeDocument(collectionName, query);
};
