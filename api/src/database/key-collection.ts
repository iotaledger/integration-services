import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, WithId } from 'mongodb';
import { KeyCollectionPersistence } from '../models/types/key-collection';

const collectionName = CollectionNames.keyCollection;
const getIndex = (index: number, id: string) => `${id}-${index}`;

export const getKeyCollection = async (index: number, serverId: string): Promise<KeyCollectionPersistence> => {
	const query = { _id: getIndex(index, serverId) };
	return await MongoDbService.getDocument<KeyCollectionPersistence>(collectionName, query);
};

export const saveKeyCollection = async (
	keyCollectionPersistence: KeyCollectionPersistence,
	serverId: string
): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
	const document = {
		_id: getIndex(keyCollectionPersistence.index, serverId),
		...keyCollectionPersistence
	};

	return MongoDbService.insertDocument<KeyCollectionPersistence>(collectionName, document);
};
