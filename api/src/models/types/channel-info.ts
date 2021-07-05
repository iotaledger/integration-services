import { Static } from '@sinclair/typebox';
import { TopicSchema, ChannelInfoSchema, ChannelInfoSearchSchema } from '../schemas/channel-info';

export type Topic = Static<typeof TopicSchema>;

export type ChannelInfo = Static<typeof ChannelInfoSchema>;

type OmitedChannelInfo = Omit<ChannelInfo, 'created' | 'latestMessage'>;

export interface ChannelInfoPersistence extends OmitedChannelInfo {
	created: Date | null;
	latestMessage?: Date;
}

export type ChannelInfoSearchString = Static<typeof ChannelInfoSearchSchema>;
export type ChannelInfoSearch = Omit<ChannelInfoSearchString, 'created' | 'latestMessage'> & { created: Date, latestMessage: Date }
