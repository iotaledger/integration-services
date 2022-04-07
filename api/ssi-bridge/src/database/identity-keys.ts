import { CollectionNames } from './constants';
import { MongoDbService } from '@iota/is-shared-modules/lib/services/mongodb-service';
import { IdentityKeys } from '@iota/is-shared-modules/lib/models/types/identity';
import { decrypt, encrypt } from '@iota/is-shared-modules/lib/utils/encryption';

const collectionName = CollectionNames.identityKeysCollection;

export const getIdentityKeys = async (id: string, secret: string): Promise<IdentityKeys | null> => {
	const query = { _id: id };
	const identity = await MongoDbService.getDocument<IdentityKeys>(collectionName, query);
	if (!identity) {
		return identity;
	}
	const decryptedIdentity: IdentityKeys = {
		...identity,
		key: {
			encoding: identity.key.encoding,
			type: identity.key.type,
			public: identity.key.public,
			secret: decrypt(identity.key.secret, secret)
		}
	};

	return decryptedIdentity;
};

export const saveIdentityKeys = async (identity: IdentityKeys, secret: string) => {
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

	const res = await MongoDbService.insertDocument<IdentityKeys>(collectionName, document);
	if (!res.result.n) {
		throw new Error('could not save identity!');
	}
	return res;
};
