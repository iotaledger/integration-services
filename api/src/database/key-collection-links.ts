import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, WithId } from 'mongodb';
import { KeyCollectionIdentityPersistence, KeyCollectionPersistence } from '../models/data/key-collection';

const collectionName = CollectionNames.keyCollectionLinks;
const getIndex = (kci: KeyCollectionIdentityPersistence) => `key-collection-index-${kci.keyCollectionIndex}-index-${kci.index}`;

export const getLinkedIdentitesSize = async (keyCollectionIndex: number): Promise<number> => {
  const query = { keyCollectionIndex };
  return MongoDbService.db.collection(collectionName).countDocuments(query);
};

export const addKeyCollectionIdentity = async (kci: KeyCollectionIdentityPersistence): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  const document = {
    _id: getIndex(kci),
    ...kci
  };

  return MongoDbService.insertDocument<KeyCollectionPersistence>(collectionName, document);
};

export const getKeyCollectionIdentity = async (did: string): Promise<KeyCollectionIdentityPersistence> => {
  const regex = (text: string) => text && new RegExp(text, 'i');

  const query = { linkedIdentity: regex(did) };
  return await MongoDbService.getDocument<KeyCollectionIdentityPersistence>(collectionName, query);
};

export const revokeKeyCollectionIdentity = async (kci: KeyCollectionIdentityPersistence) => {
  const query = {
    _id: getIndex(kci)
  };

  const update: any = {
    $set: {
      isRevoked: true,
      revokedIdentity: kci.linkedIdentity
    },
    $unset: { linkedIdentity: '' }
  };

  return MongoDbService.updateDocument(collectionName, query, update);
};
