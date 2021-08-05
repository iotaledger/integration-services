import { Type } from '@sinclair/typebox';
import { AccessRights } from '../subscription';

export const AuthorizeSubscriptionBodySchema = Type.Object({
	subscriptionLink: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	identityId: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()]))
});

export const RequestSubscriptionBodySchema = Type.Object({
	subscriptionPassword: Type.Optional(Type.String({ minLength: 8 })), // TODO#156 use to decrypt/encrypt data and state
	seed: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	accessRights: Type.Optional(Type.Union([Type.Enum(AccessRights), Type.Null()])),
	presharedKey: Type.Optional(Type.String({ maxLength: 16, minLength: 16 }))
});

export const RequestSubscriptionBodyResponseSchema = Type.Object({
	seed: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
	subscriptionLink: Type.String()
});

export const AuthorizeSubscriptionBodyResponseSchema = Type.Object({
	keyloadLink: Type.String()
});
