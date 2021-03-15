import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';

const collectionName = CollectionNames.auth;

export const getChallenge = async (userId: string): Promise<{ userId: string; challenge: string }> => {
  const query = { _id: userId };
  return await MongoDbService.getDocument<{ userId: string; challenge: string }>(collectionName, query);
};

export const upsertChallenge = async (challengResponse: { userId: string; challenge: string }) => {
  const query = { _id: challengResponse.userId };
  const update = {
    $set: { _id: challengResponse.userId, userId: challengResponse.userId, challenge: challengResponse.challenge }
  };

  const res = await MongoDbService.updateDocument(collectionName, query, update, { upsert: true });
  if (!res?.result?.n) {
    throw new Error('could not add or update the challenge!');
  }
};
