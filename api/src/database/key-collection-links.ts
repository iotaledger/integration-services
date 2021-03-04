import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, WithId } from 'mongodb';
import { KeyCollectionIdentityPersistence, KeyCollectionPersistence } from '../models/data/identity';

const collectionName = CollectionNames.keyCollectionLinks;

export const getLinkedIdentitesSize = async (keyCollectionIndex: number): Promise<number> => {
  const query = { index: keyCollectionIndex };
  return MongoDbService.db.collection(collectionName).countDocuments(query);
};

export const addKeyCollectionIdentity = async (kci: KeyCollectionIdentityPersistence): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  const document = {
    _id: `key-collection-index-${kci.keyCollectionIndex}-index-${kci.index}`,
    ...kci
  };

  return MongoDbService.insertDocument<KeyCollectionPersistence>(collectionName, document);
};

export const getKeyCollectionIdentity = async (did: string): Promise<KeyCollectionIdentityPersistence> => {
  const query = { linkedIdentity: did };
  return await MongoDbService.getDocument<KeyCollectionIdentityPersistence>(collectionName, query);
};

export const revokeKeyCollectionIdentity = async (kci: KeyCollectionIdentityPersistence) => {
  const query = {
    _id: `${kci.keyCollectionIndex}-${kci.index}`
  };

  const update = {
    $set: {
      isRevoked: true
    }
  };

  return MongoDbService.updateDocument(collectionName, query, update);
};
