import { CollectionNames } from './constants';
import { MongoDbService, decrypt, encrypt } from '@iota/is-shared-modules/node';
import { IdentityKeys } from '@iota/is-shared-modules';

const collectionName = CollectionNames.identityKeysCollection;

export const getIdentityKeys = async (id: string, secret: string): Promise<IdentityKeys | null> => {
	const query = { _id: id };
	const identity = await MongoDbService.getDocument<IdentityKeys>(collectionName, query);
	if (!identity) {
		return identity;
	}
	const decryptedIdentity: IdentityKeys = {
		...identity,
		keys: {
			sign: {
				encoding: identity.keys.sign.encoding,
				type: identity.keys.sign.type,
				public: identity.keys.sign.public,
				private: decrypt(identity.keys.sign.private, secret)
			}
		}
	};

	return decryptedIdentity;
};

export const saveIdentityKeys = async (identity: IdentityKeys, secret: string) => {
	const encryptedKey = encrypt(identity.keys.sign.private, secret);
	const encryptedIdentityKeys: IdentityKeys = {
		...identity,
		keys: {
			...identity.keys,
			sign: {
				...identity.keys.sign,
				private: encryptedKey
			}
		}
	};

	const document = {
		_id: encryptedIdentityKeys?.id,
		...encryptedIdentityKeys,
		created: new Date()
	};

	const res = await MongoDbService.insertDocument<IdentityKeys>(collectionName, document);
	if (!res.result.n) {
		throw new Error('could not save identity!');
	}
	return res;
};
