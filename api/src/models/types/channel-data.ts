import { Static } from '@sinclair/typebox';
import { ChannelDataSchema } from '../schemas/request-response-body/channel-bodies';
import { AddChannelLogBody } from './request-response-bodies';

export type ChannelLog = AddChannelLogBody;

export type ChannelData = Static<typeof ChannelDataSchema>;

