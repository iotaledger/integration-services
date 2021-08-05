import { Type } from '@sinclair/typebox';
import { AccessRights } from '../subscription';

export const AuthorizeSubscriptionBodySchema = Type.Object({
	subscriptionLink: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	identityId: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()]))
});

export const RequestSubscriptionBodySchema = Type.Object({
	seed: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	accessRights: Type.Optional(Type.Union([Type.Enum(AccessRights), Type.Null()]))
});

export const RequestSubscriptionBodyResponseSchema = Type.Object({
	seed: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
	subscriptionLink: Type.String()
});

export const AuthorizeSubscriptionBodyResponseSchema = Type.Object({
	keyloadLink: Type.String()
});
