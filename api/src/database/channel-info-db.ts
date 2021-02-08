import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { ChannelInfo } from '../models/data/channel-info';

export const getChannelInfo = async (channelAddress: string) => {
  const query = { _id: channelAddress };
  const collectionName = CollectionNames.channelInfo;
  return await Promise.resolve(MongoDbService.getDocument<ChannelInfo[]>(collectionName, query));
};

export const addChannelInfo = async (channelInfo: ChannelInfo) => {
  const document = {
    _id: channelInfo.channelAddress,
    ...channelInfo
  };

  console.log('document', document);

  const collectionName = CollectionNames.channelInfo;
  return Promise.resolve(MongoDbService.insertDocument(collectionName, document));
};
