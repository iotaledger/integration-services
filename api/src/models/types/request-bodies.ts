import { Static } from '@sinclair/typebox';
import { ProveOwnershipPostBodySchema } from '../schemas/request-body/authentication-bodies';
import {
	AddChannelLogBodySchema,
	AuthorizeSubscriptionBodySchema,
	CreateChannelBodySchema,
	RequestSubscriptionBodySchema
} from '../schemas/request-body/channel-bodies';
import { ChannelInfoSchema } from '../schemas/channel-info';
import { UserSchema } from '../schemas/user';
import { CreateUserBodySchema } from '../schemas/request-body/user-bodies';
import {
	RevokeVerificationBodySchema,
	TrustedRootBodySchema,
	VerifiableCredentialBodySchema,
	VerifyIdentityBodySchema
} from '../schemas/request-body/verification-bodies';
import { CreateChannelBodyResponseSchema } from '../schemas/request-body/channel-bodies';
import { AuthorizeSubscriptionBodyResponseSchema, RequestSubscriptionBodyResponseSchema } from '../schemas/request-body/subscription-bodies';

export type ProveOwnershipPostBody = Static<typeof ProveOwnershipPostBodySchema>;

export type ChannelInfoBody = Static<typeof ChannelInfoSchema>;

export type CreateUserBody = Static<typeof CreateUserBodySchema>;
export type UserSchemaBody = Static<typeof UserSchema>;

export type CreateChannelBody = Static<typeof CreateChannelBodySchema>;
export type CreateChannelBodyResponse = Static<typeof CreateChannelBodyResponseSchema>;
export type AddChannelLogBody = Static<typeof AddChannelLogBodySchema>;
export type AuthorizeSubscriptionBody = Static<typeof AuthorizeSubscriptionBodySchema>;
export type RequestSubscriptionBody = Static<typeof RequestSubscriptionBodySchema>;
export type RequestSubscriptionBodyResponse = Static<typeof RequestSubscriptionBodyResponseSchema>;
export type AuthorizeSubscriptionBodyResponse = Static<typeof AuthorizeSubscriptionBodyResponseSchema>;

export type VerifiableCredentialBody = Static<typeof VerifiableCredentialBodySchema>;
export type VerifyIdentityBody = Static<typeof VerifyIdentityBodySchema>;
export type RevokeVerificationBody = Static<typeof RevokeVerificationBodySchema>;
export type TrustedRootBody = Static<typeof TrustedRootBodySchema>;
