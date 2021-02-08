import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { ChannelInfo } from '../models/data/channel-info';

export const getChannelInfo = async (channelAddress: string) => {
  const query = { _id: channelAddress };
  const collectionName = CollectionNames.channelInfo;
  return await MongoDbService.getDocument<ChannelInfo>(collectionName, query);
};

export const addChannelInfo = async (channelInfo: ChannelInfo) => {
  const document = {
    _id: channelInfo.channelAddress,
    ...channelInfo
  };

  const collectionName = CollectionNames.channelInfo;
  return MongoDbService.insertDocument(collectionName, document);
};

export const updateChannelInfo = async (channelInfo: ChannelInfo) => {
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

export const removeChannelInfo = async (channelAddress: string) => {
  const query = { _id: channelAddress };
  const collectionName = CollectionNames.channelInfo;
  return MongoDbService.removeDocument(collectionName, query);
};
