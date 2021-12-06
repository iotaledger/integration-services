import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, WithId } from 'mongodb';
import { DocumentJsonUpdate, IdentityJson, IdentityKeys } from '../models/types/identity';
import { decrypt, encrypt } from '../utils/encryption';

const collectionName = CollectionNames.identityDocsCollection;

export const getIdentityDoc = async (id: string, secret: string): Promise<IdentityKeys | null> => {
	const query = { _id: id };
	const identity = await MongoDbService.getDocument<IdentityKeys>(collectionName, query);
	if (!identity) {
		return identity;
	}
	const decryptedIdentity: IdentityKeys = {
		...identity,
		key: {
			public: identity.key.public,
			secret: decrypt(identity.key.secret, secret)
		}
	};

	return decryptedIdentity;
};

export const saveIdentity = async (identity: IdentityKeys, secret: string): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
	const encryptedKey = encrypt(identity.key.secret, secret);
	const encryptedIdentity: IdentityKeys = {
		...identity,
		key: {
			...identity.key,
			secret: encryptedKey
		}
	};

	const document = {
		_id: encryptedIdentity?.id,
		...encryptedIdentity,
		created: new Date()
	};

	const res = await MongoDbService.insertDocument<IdentityJson>(collectionName, document);
	if (!res.result.n) {
		throw new Error('could not save identity!');
	}
	return res;
};

export const updateIdentityDoc = async (docUpdate: DocumentJsonUpdate) => {
	const { doc } = docUpdate;
	if (!doc?.id) {
		throw new Error('no valid id provided for the identity!');
	}
	const query = {
		_id: doc?.id
	};

	const update: any = {
		$set: {
			doc
		}
	};

	const res = await MongoDbService.updateDocument(collectionName, query, update);
	if (!res.result.n) {
		throw new Error('could not update identity!');
	}
	return res;
};
