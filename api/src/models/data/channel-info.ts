import { Type, Static } from '@sinclair/typebox';

const TopicSchema = Type.Object({
  type: Type.String(),
  source: Type.String()
});

export const ChannelInfoSchema = Type.Object({
  channelAddress: Type.String(),
  authorId: Type.String(),
  subscriberIds: Type.Optional(Type.Array(Type.String())),
  topics: Type.Array(TopicSchema),
  created: Type.Optional(Type.String()),
  latestMessage: Type.Optional(Type.String())
});

export type Topic = Static<typeof TopicSchema>;
export type ChannelInfoDto = Static<typeof ChannelInfoSchema>;
type OmitedChannelInfoDto = Omit<ChannelInfoDto, 'created' | 'latestMessage'>;

export interface ChannelInfo extends OmitedChannelInfoDto {
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
