import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, WithId } from 'mongodb';
import { DocumentJsonUpdate, IdentityJsonUpdate } from '../models/types/identity';
import { decrypt, encrypt } from '../utils/encryption';

const collectionName = CollectionNames.identitiesCollection;

export const getIdentity = async (id: string, secret: string): Promise<IdentityJsonUpdate | null> => {
	const query = { _id: id };
	const identity = await MongoDbService.getDocument<IdentityJsonUpdate>(collectionName, query);
	if (!identity) {
		return identity;
	}
	const decryptedIdentity: IdentityJsonUpdate = {
		...identity,
		key: {
			...identity.key,
			secret: decrypt(identity.key.secret, secret)
		}
	};

	return decryptedIdentity;
};

export const saveIdentity = async (identity: IdentityJsonUpdate, secret: string): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
	const encryptedKey = encrypt(identity.key.secret, secret);
	const encryptedIdentity: IdentityJsonUpdate = {
		...identity,
		key: {
			...identity.key,
			secret: encryptedKey
		}
	};

	const document = {
		_id: encryptedIdentity?.doc?.id,
		...encryptedIdentity
	};

	const res = await MongoDbService.insertDocument<IdentityJsonUpdate>(collectionName, document);
	if (!res.result.n) {
		throw new Error('could not save identity!');
	}
	return res;
};

export const updateIdentityDoc = async (docUpdate: DocumentJsonUpdate) => {
	const { doc, txHash } = docUpdate;
	if (!doc?.id) {
		throw new Error('no valid id provided for the identity!');
	}
	const query = {
		_id: doc?.id
	};

	const update: any = {
		$set: {
			doc,
			txHash
		}
	};

	const res = await MongoDbService.updateDocument(collectionName, query, update);
	if (!res.result.n) {
		throw new Error('could not update identity!');
	}
	return res;
};
