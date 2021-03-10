import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { ChannelInfoPersistence, ChannelInfoSearch } from '../models/data/channel-info';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';

const collectionName = CollectionNames.channelInfo;

export const getChannelInfo = async (channelAddress: string): Promise<ChannelInfoPersistence> => {
  const query = { _id: channelAddress };
  return await MongoDbService.getDocument<ChannelInfoPersistence>(collectionName, query);
};

export const searchChannelInfo = async (channelInfoSearch: ChannelInfoSearch): Promise<ChannelInfoPersistence[]> => {
  const regex = (text: string) => text && new RegExp(text, 'i');
  const { authorId, created, latestMessage, topicType, topicSource, limit, index } = channelInfoSearch;
  const query = {
    authorId: regex(authorId),
    created: created && { $gte: created },
    latestMessage: latestMessage && { $gte: latestMessage },
    'topics.source': regex(topicSource),
    'topics.type': regex(topicType)
  };
  const plainQuery = MongoDbService.getPlainObject(query);
  const skip = index > 0 ? (index - 1) * limit : 0;
  const options = limit != null ? { limit, skip } : undefined;

  return await MongoDbService.getDocuments<ChannelInfoPersistence>(collectionName, plainQuery, options);
};

export const addChannelInfo = async (channelInfo: ChannelInfoPersistence): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  const document = {
    _id: channelInfo.channelAddress,
    ...channelInfo,
    created: new Date()
  };

  const collectionName = CollectionNames.channelInfo;
  return MongoDbService.insertDocument(collectionName, document);
};

export const updateChannelInfo = async (channelInfo: ChannelInfoPersistence): Promise<UpdateWriteOpResult> => {
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
