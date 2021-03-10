import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { LinkedKeyCollectionIdentityPersistence, KeyCollectionPersistence } from '../models/data/key-collection';

const collectionName = CollectionNames.keyCollectionLinks;
const getIndex = (kci: LinkedKeyCollectionIdentityPersistence) => `key-collection-index-${kci.keyCollectionIndex}-index-${kci.index}`;

export const getLinkedIdentitesSize = async (keyCollectionIndex: number): Promise<number> => {
  const query = { keyCollectionIndex };
  return MongoDbService.db.collection(collectionName).countDocuments(query);
};

export const addKeyCollectionIdentity = async (kci: LinkedKeyCollectionIdentityPersistence): Promise<void> => {
  const document = {
    _id: getIndex(kci),
    ...kci
  };

  const res = await MongoDbService.insertDocument<KeyCollectionPersistence>(collectionName, document);
  if (!res?.result?.n) {
    throw new Error('could not add key collection to the identity!');
  }
};

export const getLinkedKeyCollectionIdentity = async (did: string): Promise<LinkedKeyCollectionIdentityPersistence> => {
  const regex = (text: string) => text && new RegExp(text, 'i');

  const query = { linkedIdentity: regex(did) };
  return await MongoDbService.getDocument<LinkedKeyCollectionIdentityPersistence>(collectionName, query);
};

export const revokeKeyCollectionIdentity = async (kci: LinkedKeyCollectionIdentityPersistence) => {
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

  const res = await MongoDbService.updateDocument(collectionName, query, update);
  if (!res?.result.n) {
    throw new Error('could not revoke identity');
  }
};
