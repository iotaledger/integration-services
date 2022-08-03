import { CollectionNames } from './constants';
import { MongoDbService } from '@iota/is-shared-modules/node';
import { ConcurrencyLock } from '@iota/is-shared-modules';

const collectionName = CollectionNames.concurrencyLocks;

export const getLock = async (lock: string): Promise<ConcurrencyLock | null> => {
	const query = { _id: lock };
	return MongoDbService.getDocument<ConcurrencyLock>(collectionName, query);
};

export const insertLock = async (lock: string) => {
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

export const removeLock = async (lock: string) => {
	const query = { _id: lock };
	return MongoDbService.removeDocument(collectionName, query);
};
