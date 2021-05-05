import { Static } from '@sinclair/typebox';
import {
	AddChannelLogBodySchema,
	AuthorizeSubscriptionBodySchema,
	CreateChannelBodySchema,
	RequestSubscriptionBodySchema
} from '../schemas/request-bodies';

export type CreateChannelBody = Static<typeof CreateChannelBodySchema>;

export type AddChannelLogBody = Static<typeof AddChannelLogBodySchema>;

export type AuthorizeSubscriptionBody = Static<typeof AuthorizeSubscriptionBodySchema>;

export type RequestSubscriptionBody = Static<typeof RequestSubscriptionBodySchema>;
