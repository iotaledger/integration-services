import { Static } from '@sinclair/typebox';
import { ChannelDataSchema, ChannelLogSchema } from '../schemas/request-response-body/channel-bodies';

export type ChannelLog = Static<typeof ChannelLogSchema>;
export type ChannelData = Static<typeof ChannelDataSchema>;
