import { Static } from '@sinclair/typebox';
import { TopicSchema, ChannelInfoSchema, ChannelSubscriptionSchema } from '../schemas/channel-info';

export type Topic = Static<typeof TopicSchema>;
export type ChannelSubscription = Static<typeof ChannelSubscriptionSchema>;

export type ChannelInfo = Static<typeof ChannelInfoSchema>;
type OmitedChannelInfo = Omit<ChannelInfo, 'created' | 'latestMessage'>;

export interface ChannelInfoPersistence extends OmitedChannelInfo {
	created: Date | null;
	latestMessage?: Date;
}

export interface ChannelInfoSearch {
	authorId?: string;
	author?: string; // username
	topicType?: string;
	topicSource?: string;
	created?: Date;
	latestMessage?: Date;
	limit?: number;
	index?: number;
}
