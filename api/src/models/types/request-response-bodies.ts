import { Static } from '@sinclair/typebox';
import { NonceSchema, ProveOwnershipPostBodySchema } from '../schemas/request-response-body/authentication-bodies';
import { AddChannelLogBodySchema, CreateChannelBodySchema, ReimportBodySchema } from '../schemas/request-response-body/channel-bodies';
import { ChannelInfoSchema } from '../schemas/channel-info';
import { IdentitySchema } from '../schemas/user';
import {
	RevokeVerificationBodySchema,
	TrustedRootBodySchema,
	VerifiableCredentialBodySchema,
	VerifyIdentityBodySchema
} from '../schemas/request-response-body/verification-bodies';
import { CreateChannelBodyResponseSchema } from '../schemas/request-response-body/channel-bodies';
import {
	AuthorizeSubscriptionBodyResponseSchema,
	AuthorizeSubscriptionBodySchema,
	RequestSubscriptionBodyResponseSchema,
	RequestSubscriptionBodySchema
} from '../schemas/request-response-body/subscription-bodies';

export type ProveOwnershipPostBody = Static<typeof ProveOwnershipPostBodySchema>;
export type Nonce = Static<typeof NonceSchema>;

export type ChannelInfoBody = Static<typeof ChannelInfoSchema>;

export type UserSchemaBody = Static<typeof IdentitySchema>;

export type CreateChannelBody = Static<typeof CreateChannelBodySchema>;
export type CreateChannelBodyResponse = Static<typeof CreateChannelBodyResponseSchema>;
export type AddChannelLogBody = Static<typeof AddChannelLogBodySchema>;
export type ReimportBody = Static<typeof ReimportBodySchema>;
export type AuthorizeSubscriptionBody = Static<typeof AuthorizeSubscriptionBodySchema>;
export type RequestSubscriptionBody = Static<typeof RequestSubscriptionBodySchema>;
export type RequestSubscriptionBodyResponse = Static<typeof RequestSubscriptionBodyResponseSchema>;
export type AuthorizeSubscriptionBodyResponse = Static<typeof AuthorizeSubscriptionBodyResponseSchema>;

export type VerifiableCredentialBody = Static<typeof VerifiableCredentialBodySchema>;
export type VerifyIdentityBody = Static<typeof VerifyIdentityBodySchema>;
export type RevokeVerificationBody = Static<typeof RevokeVerificationBodySchema>;
export type TrustedRootBody = Static<typeof TrustedRootBodySchema>;
