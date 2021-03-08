import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, WithId } from 'mongodb';
import { KeyCollectionPersistence } from '../models/data/key-collection';

const collectionName = CollectionNames.keyCollection;

export const getKeyCollection = async (index: number): Promise<KeyCollectionPersistence> => {
  const query = { _id: index };
  return await MongoDbService.getDocument<KeyCollectionPersistence>(collectionName, query);
};

export const saveKeyCollection = async (keyCollectionPersistence: KeyCollectionPersistence): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  const document = {
    _id: keyCollectionPersistence.index,
    ...keyCollectionPersistence
  };

  return MongoDbService.insertDocument<KeyCollectionPersistence>(collectionName, document);
};
