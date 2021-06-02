import { AddChannelLogBody } from './request-bodies';

export type ChannelLog = AddChannelLogBody;

export interface ChannelData {
	link: string;
	channelLog: ChannelLog;
}
