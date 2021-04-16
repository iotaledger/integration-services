import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, WithId } from 'mongodb';
import { KeyCollectionPersistence } from '../models/types/key-collection';
import { decrypt, encrypt } from '../utils/encryption';

const collectionName = CollectionNames.keyCollection;
const getIndex = (index: number, id: string) => `${id}-${index}`;

export const getKeyCollection = async (index: number, serverId: string, secret: string): Promise<KeyCollectionPersistence> => {
	const query = { _id: getIndex(index, serverId) };
	const keyCollection = await MongoDbService.getDocument<KeyCollectionPersistence>(collectionName, query);
	if (!keyCollection) {
		throw new Error('no keycollection found to sign credentials!');
	}
	const decryptedKC: KeyCollectionPersistence = {
		...keyCollection,
		keys: keyCollection.keys.map((key) => {
			return {
				public: key.public,
				secret: decrypt(key.secret, secret)
			};
		})
	};
	return decryptedKC;
};

export const saveKeyCollection = async (
	kcp: KeyCollectionPersistence,
	serverId: string,
	secret: string
): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
	const encryptedKC: KeyCollectionPersistence = {
		...kcp,
		keys: kcp.keys.map((key) => {
			return {
				public: key.public,
				secret: encrypt(key.secret, secret)
			};
		})
	};

	const document = {
		_id: getIndex(encryptedKC.index, serverId),
		...encryptedKC
	};

	return MongoDbService.insertDocument<KeyCollectionPersistence>(collectionName, document);
};
