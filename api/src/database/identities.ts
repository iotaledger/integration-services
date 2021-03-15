import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, WithId } from 'mongodb';
import { DocumentUpdate, IdentityUpdate } from '../models/data/identity';

const collectionName = CollectionNames.identitiesCollection;

export const getIdentity = async (id: string): Promise<IdentityUpdate> => {
  const query = { _id: id };
  return await MongoDbService.getDocument<IdentityUpdate>(collectionName, query);
};

export const saveIdentity = async (identity: IdentityUpdate): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  const document = {
    _id: identity?.doc?.id,
    ...identity
  };

  const res = await MongoDbService.insertDocument<IdentityUpdate>(collectionName, document);
  if (!res.result.n) {
    throw new Error('could not save identity!');
  }
  return res;
};

export const updateIdentityDoc = async (docUpdate: DocumentUpdate) => {
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
