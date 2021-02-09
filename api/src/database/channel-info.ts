import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { ChannelInfo } from '../models/data/channel-info';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';

export const getChannelInfo = async (channelAddress: string): Promise<ChannelInfo> => {
  const query = { _id: channelAddress };
  const collectionName = CollectionNames.channelInfo;
  return await MongoDbService.getDocument<ChannelInfo>(collectionName, query);
};

export const addChannelInfo = async (channelInfo: ChannelInfo): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  const document = {
    _id: channelInfo.channelAddress,
    ...channelInfo
  };

  const collectionName = CollectionNames.channelInfo;
  return MongoDbService.insertDocument(collectionName, document);
};

export const updateChannelInfo = async (channelInfo: ChannelInfo): Promise<UpdateWriteOpResult> => {
  const query = {
    _id: channelInfo.channelAddress
  };
  const { topics } = channelInfo;
  const update = {
    $set: {
      topics
    }
  };

  const collectionName = CollectionNames.channelInfo;
  return MongoDbService.upsertDocument(collectionName, query, update);
};

export const removeChannelInfo = async (channelAddress: string): Promise<DeleteWriteOpResultObject> => {
  const query = { _id: channelAddress };
  const collectionName = CollectionNames.channelInfo;
  return MongoDbService.removeDocument(collectionName, query);
};
