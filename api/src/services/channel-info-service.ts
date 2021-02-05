import { ChannelInfoDto, ChannelInfo } from '../models/data/channel-info';

export const getChannelInfo = (): ChannelInfoDto => {
  console.log('Get user');
  // TODO get data from db
  return {
    created: new Date().toDateString(),
    subscribers: [],
    channelAddress: '',
    topics: [{ source: 'device-kitchen', type: 'temperature' }],
    latestMessage: new Date().toDateString(),
    author: null
  };
};

export const addChannelInfo = (channelInfo: ChannelInfo): void => {
  console.log('Add user');
};

export const updateChannelInfo = (channelInfo: ChannelInfo): void => {
  console.log('Delete user');
};

export const deleteChannelInfo = (channelAddress: string): void => {
  console.log('Delete user');
  throw new Error('YO DIS VRONG');
};
