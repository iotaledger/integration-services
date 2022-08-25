import { Static } from '@sinclair/typebox';
import { NonceSchema, ProveOwnershipPostBodySchema, VerifyJwtBodySchema } from '../schemas/request-response-body/authentication-bodies';
import {
	AddChannelLogBodySchema,
	CreateChannelBodySchema,
	ReimportBodySchema,
	ValidateBodySchema,
	ValidateResponseSchema
} from '../schemas/request-response-body/channel-bodies';
import { ChannelInfoSchema } from '../schemas/channel-info';
import { IdentitySchema } from '../schemas/user';
import {
	RevokeVerificationBodySchema,
	TrustedRootBodySchema,
	CreateCredentialBodySchema
} from '../schemas/request-response-body/verification-bodies';
import { CreateChannelResponseSchema } from '../schemas/request-response-body/channel-bodies';
import {
	AuthorizeSubscriptionResponseSchema,
	AuthorizeSubscriptionBodySchema,
	RequestSubscriptionResponseSchema,
	RequestSubscriptionBodySchema,
	RevokeSubscriptionBodySchema
} from '../schemas/request-response-body/subscription-bodies';

export type ProveOwnershipPostBody = Static<typeof ProveOwnershipPostBodySchema>;
export type VerifyJwtBody = Static<typeof VerifyJwtBodySchema>;
export type Nonce = Static<typeof NonceSchema>;

export type ChannelInfoBody = Static<typeof ChannelInfoSchema>;

export type IdentitySchemaBody = Static<typeof IdentitySchema>;

export type CreateChannelBody = Static<typeof CreateChannelBodySchema>;
export type CreateChannelResponse = Static<typeof CreateChannelResponseSchema>;
export type AddChannelLogBody = Static<typeof AddChannelLogBodySchema>;
export type ReimportBody = Static<typeof ReimportBodySchema>;
export type ValidateBody = Static<typeof ValidateBodySchema>;
export type ValidateResponse = Static<typeof ValidateResponseSchema>;
export type AuthorizeSubscriptionBody = Static<typeof AuthorizeSubscriptionBodySchema>;
export type RevokeSubscriptionBody = Static<typeof RevokeSubscriptionBodySchema>;
export type RequestSubscriptionBody = Static<typeof RequestSubscriptionBodySchema>;
export type RequestSubscriptionResponse = Static<typeof RequestSubscriptionResponseSchema>;
export type AuthorizeSubscriptionResponse = Static<typeof AuthorizeSubscriptionResponseSchema>;

export type CreateCredentialBody = Static<typeof CreateCredentialBodySchema>;
export type RevokeVerificationBody = Static<typeof RevokeVerificationBodySchema>;
export type TrustedRootBody = Static<typeof TrustedRootBodySchema>;
