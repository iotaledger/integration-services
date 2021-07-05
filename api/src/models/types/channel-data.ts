import { Static } from '@sinclair/typebox';
import { ChannelDataSchema } from '../schemas/request-body/channel-bodies';
import { AddChannelLogBody } from './request-bodies';

export type ChannelLog = AddChannelLogBody;

export type ChannelData = Static<typeof ChannelDataSchema>;

