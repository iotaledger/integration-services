import { ChannelInfo } from '../models/data/channel-info';
import * as ChannelInfoDb from '../database/channel-info';

export const getChannelInfo = (channelAddress: string) => {
  return ChannelInfoDb.getChannelInfo(channelAddress);
};

export const addChannelInfo = (channelInfo: ChannelInfo): void => {
  ChannelInfoDb.addChannelInfo(channelInfo);
};

export const updateChannelInfo = (channelInfo: ChannelInfo): void => {
  ChannelInfoDb.updateChannelInfo(channelInfo);
};

export const deleteChannelInfo = (channelAddress: string): void => {
  // TODO proper error handling
  // throw new Error('AJSIDOJASOID');
  //return;
  ChannelInfoDb.removeChannelInfo(channelAddress);
};
