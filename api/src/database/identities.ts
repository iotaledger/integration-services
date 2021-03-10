import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, WithId } from 'mongodb';
import { IdentityDocumentJson, IdentityResponse } from '../models/data/identity';

const collectionName = CollectionNames.identitiesCollection;

export const getIdentity = async (id: string): Promise<IdentityResponse> => {
  const query = { _id: id };
  return await MongoDbService.getDocument<IdentityResponse>(collectionName, query);
};

export const saveIdentity = async (identity: IdentityResponse): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  const document = {
    _id: identity?.doc?.id,
    ...identity
  };

  return MongoDbService.insertDocument<IdentityResponse>(collectionName, document);
};

export const updateIdentityDoc = async (doc: IdentityDocumentJson) => {
  if (!doc?.id) {
    throw new Error('No valid id provided for the identity!');
  }
  const query = {
    _id: doc?.id
  };

  const update: any = {
    $set: {
      doc: doc
    }
  };

  return MongoDbService.updateDocument(collectionName, query, update);
};
