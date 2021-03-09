import { Type, Static } from '@sinclair/typebox';

const TopicSchema = Type.Object({
  type: Type.String(),
  source: Type.String()
});

export const ChannelInfoSchema = Type.Object({
  channelAddress: Type.String({ minLength: 10 }),
  authorId: Type.String({ minLength: 53, maxLength: 53 }),
  subscriberIds: Type.Optional(Type.Array(Type.String())),
  topics: Type.Array(TopicSchema),
  created: Type.Optional(Type.String()),
  latestMessage: Type.Optional(Type.String())
});

export type Topic = Static<typeof TopicSchema>;

export type ChannelInfo = Static<typeof ChannelInfoSchema>;
type OmitedChannelInfo = Omit<ChannelInfo, 'created' | 'latestMessage'>;

export interface ChannelInfoPersistence extends OmitedChannelInfo {
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
