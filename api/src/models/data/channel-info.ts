export interface ChannelInfoDto {
  channelAddress: string;
  author: any;
  subscribers: any[];
  topics: Topic[];
  created: string;
  latestMessage: string;
}

export interface ChannelInfo {
  channelAddress: string;
  author: any;
  subscribers: any[];
  topics: Topic[];
  created: Date;
  latestMessage?: Date;
}

export interface Topic {
  type: string;
  source: string;
}
