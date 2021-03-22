import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, WithId } from 'mongodb';
import { DocumentJsonUpdate, IdentityJsonUpdate } from '../models/data/identity';

const collectionName = CollectionNames.identitiesCollection;

export const getIdentity = async (id: string): Promise<IdentityJsonUpdate> => {
	const query = { _id: id };
	return await MongoDbService.getDocument<IdentityJsonUpdate>(collectionName, query);
};

export const saveIdentity = async (identity: IdentityJsonUpdate): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
	const document = {
		_id: identity?.doc?.id,
		...identity
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

export const updateIdentity = async (identity: IdentityJsonUpdate) => {
	const { doc, txHash, vc } = identity;
	if (!doc?.id) {
		throw new Error('no valid id provided for the identity!');
	}
	const query = {
		_id: doc?.id
	};

	const updateObject = MongoDbService.getPlainObject({
		doc,
		txHash,
		vc
	});
	const update: any = {
		$set: updateObject
	};

	const res = await MongoDbService.updateDocument(collectionName, query, update);
	if (!res.result.n) {
		throw new Error('could not update identity!');
	}
	return res;
};
