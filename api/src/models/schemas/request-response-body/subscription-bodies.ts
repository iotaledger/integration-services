import { Type } from '@sinclair/typebox';
import { AccessRights } from '../subscription';

export const AuthorizeSubscriptionBodySchema = Type.Object({
	subscriptionLink: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	identityId: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()]))
});

export const RevokeSubscriptionBodySchema = Type.Object({
	subscriptionLink: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	identityId: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()]))
});

export const RequestSubscriptionBodySchema = Type.Object({
	seed: Type.Optional(
		Type.Union([
			Type.String({
				minLength: 32,
				description:
					'If left empty the api will generate a seed. Make sure you store the seed since the API will not store it. You can reuse your seed for different channels.'
			}),
			Type.Null()
		])
	),
	accessRights: Type.Optional(Type.Union([Type.Enum(AccessRights), Type.Null()])),
	presharedKey: Type.Optional(Type.String({ maxLength: 32, minLength: 32 }))
});

export const RequestSubscriptionResponseSchema = Type.Object({
	seed: Type.Union([
		Type.String({
			minLength: 32,
			maxLength: 72,
			description:
				'Auto generated seed. Make sure you store the seed since the API will not store it. You can reuse your seed for different channels.'
		}),
		Type.Null()
	]),
	subscriptionLink: Type.String()
});

export const AuthorizeSubscriptionResponseSchema = Type.Object({
	keyloadLink: Type.String()
});
