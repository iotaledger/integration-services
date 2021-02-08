import { ChannelInfo } from '../models/data/channel-info';
import * as ChannelInfoDb from '../database/channel-info';

export const getChannelInfo = async (channelAddress: string) => {
  return ChannelInfoDb.getChannelInfo(channelAddress);
};

export const addChannelInfo = async (channelInfo: ChannelInfo) => {
  return ChannelInfoDb.addChannelInfo(channelInfo);
};

export const updateChannelInfo = async (channelInfo: ChannelInfo) => {
  return ChannelInfoDb.updateChannelInfo(channelInfo);
};

export const deleteChannelInfo = async (channelAddress: string) => {
  return ChannelInfoDb.removeChannelInfo(channelAddress);
};
