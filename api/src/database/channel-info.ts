import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { ChannelInfo, ChannelInfoSearch } from '../models/data/channel-info';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';

const collectionName = CollectionNames.channelInfo;

export const getChannelInfo = async (channelAddress: string): Promise<ChannelInfo> => {
  const query = { _id: channelAddress };
  return await MongoDbService.getDocument<ChannelInfo>(collectionName, query);
};

export const searchChannelInfo = async (channelInfoSearch: ChannelInfoSearch): Promise<ChannelInfo[]> => {
  const regex = (text: string) => text && new RegExp(text, 'i');
  const { authorId, created, latestMessage, topicType, topicSource } = channelInfoSearch;
  const query = {
    authorId: regex(authorId),
    created: created && { $gte: created },
    latestMessage: latestMessage && { $gte: latestMessage },
    'topics.source': topicSource,
    'topics.type': topicType
  };
  const plainQuery = MongoDbService.getPlainObject(query);
  console.log('QQQ', plainQuery);

  return await MongoDbService.getDocuments<ChannelInfo>(collectionName, plainQuery);
};

export const addChannelInfo = async (channelInfo: ChannelInfo): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  const document = {
    _id: channelInfo.channelAddress,
    ...channelInfo,
    created: new Date()
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

  return MongoDbService.updateDocument(collectionName, query, update);
};

export const deleteChannelInfo = async (channelAddress: string): Promise<DeleteWriteOpResultObject> => {
  const query = { _id: channelAddress };
  return MongoDbService.removeDocument(collectionName, query);
};
