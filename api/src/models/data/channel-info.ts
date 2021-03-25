import { Static } from '@sinclair/typebox';
import { TopicSchema, ChannelInfoSchema } from '../schemas/channel-info';

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
