import { ChannelInfo } from '../models/data/channel-info';
import * as ChannelInfoDb from '../database/channel-info-db';

export const getChannelInfo = (channelAddress: string) => {
  // TODO get data from db
  return ChannelInfoDb.getChannelInfo(channelAddress);
};

export const addChannelInfo = (channelInfo: ChannelInfo): void => {
  console.log('Add channelInfo');
  ChannelInfoDb.addChannelInfo(channelInfo);
};

export const updateChannelInfo = (channelInfo: ChannelInfo): void => {
  console.log('Delete user');
};

export const deleteChannelInfo = (channelAddress: string): void => {
  console.log('Delete user');
  throw new Error('YO DIS VRONG');
};
