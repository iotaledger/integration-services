import { ChannelInfo } from '../models/data/channel-info';
import * as ChannelInfoDb from '../database/channel-info';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';

export const getChannelInfo = async (channelAddress: string): Promise<ChannelInfo> => {
  return ChannelInfoDb.getChannelInfo(channelAddress);
};

export const addChannelInfo = async (channelInfo: ChannelInfo): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
  return ChannelInfoDb.addChannelInfo(channelInfo);
};

export const updateChannelInfo = async (channelInfo: ChannelInfo): Promise<UpdateWriteOpResult> => {
  return ChannelInfoDb.updateChannelInfo(channelInfo);
};

export const deleteChannelInfo = async (channelAddress: string): Promise<DeleteWriteOpResultObject> => {
  return ChannelInfoDb.removeChannelInfo(channelAddress);
};
