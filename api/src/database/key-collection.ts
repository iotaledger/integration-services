import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, WithId } from 'mongodb';
import { KeyCollectionPersistence } from '@iota-is/shared-modules/lib/types/key-collection';
import { decrypt, encrypt } from '../utils/encryption';

const collectionName = CollectionNames.keyCollection;
const getIndex = (index: number, id: string) => `${id}-${index}`;

export const getKeyCollection = async (index: number, serverId: string, secret: string): Promise<KeyCollectionPersistence | null> => {
	const query = { _id: getIndex(index, serverId) };
	const keyCollection = await MongoDbService.getDocument<KeyCollectionPersistence>(collectionName, query);
	if (!keyCollection) {
		return null;
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
		...encryptedKC,
		created: new Date()
	};

	return MongoDbService.insertDocument<KeyCollectionPersistence>(collectionName, document);
};
