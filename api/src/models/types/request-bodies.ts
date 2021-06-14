import { Static } from '@sinclair/typebox';
import {
	AddChannelLogBodySchema,
	AuthorizeSubscriptionBodySchema,
	CreateChannelBodySchema,
	RequestSubscriptionBodySchema
} from '../schemas/channel-bodies';
import { RevokeVerificationSchema, VerifyIdentitySchema } from '../schemas/verification-bodies';

export type CreateChannelBody = Static<typeof CreateChannelBodySchema>;
export type AddChannelLogBody = Static<typeof AddChannelLogBodySchema>;
export type AuthorizeSubscriptionBody = Static<typeof AuthorizeSubscriptionBodySchema>;
export type RequestSubscriptionBody = Static<typeof RequestSubscriptionBodySchema>;

export type VerifyIdentityBody = Static<typeof VerifyIdentitySchema>;
export type RevokeVerificationBody = Static<typeof RevokeVerificationSchema>;
