export interface ChannelInfoDto {
  channelAddress: string;
  authorId: string;
  subscriberIds?: string[];
  topics: Topic[];
  created?: string;
  latestMessage?: string;
}

export interface ChannelInfo {
  channelAddress: string;
  authorId: string;
  subscriberIds: string[];
  topics: Topic[];
  created: Date | null;
  latestMessage?: Date;
}

export interface ChannelInfoSearch {
  authorId?: string;
  author?: string;
  topicType?: string;
  topicSource?: string;
  created?: Date;
  latestMessage?: Date;
  limit?: number;
  index?: number;
}

export interface Topic {
  type: string;
  source: string;
}
