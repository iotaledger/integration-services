import { ChannelInfo, ChannelInfoSearch } from '../models/data/channel-info';
import * as ChannelInfoDb from '../database/channel-info';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';
import { getUser } from './user-service';

export const getChannelInfo = async (channelAddress: string): Promise<ChannelInfo> => {
  return ChannelInfoDb.getChannelInfo(channelAddress);
};

export const searchChannelInfo = async (channelInfoSearch: ChannelInfoSearch): Promise<ChannelInfo[]> => {
  if (channelInfoSearch.author && !channelInfoSearch.authorId) {
    const authorId = await (await getUser(channelInfoSearch.author))?.userId;
    const c = {
      ...channelInfoSearch,
      authorId
    };
    return ChannelInfoDb.searchChannelInfo(c);
  }
  return ChannelInfoDb.searchChannelInfo(channelInfoSearch);
};

export const addChannelInfo = async (channelInfo: ChannelInfo): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  return ChannelInfoDb.addChannelInfo(channelInfo);
};

export const updateChannelInfo = async (channelInfo: ChannelInfo): Promise<UpdateWriteOpResult> => {
  return ChannelInfoDb.updateChannelInfo(channelInfo);
};

export const deleteChannelInfo = async (channelAddress: string): Promise<DeleteWriteOpResultObject> => {
  return ChannelInfoDb.deleteChannelInfo(channelAddress);
};
