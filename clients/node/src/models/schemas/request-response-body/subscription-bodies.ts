import { Type } from '@sinclair/typebox';
import { AccessRights } from '../subscription';

export const AuthorizeSubscriptionBodySchema = Type.Object({
	subscriptionLink: Type.Optional(Type.String({ minLength: 1 })),
	identityId: Type.Optional(Type.String({ minLength: 1 }))
});

export const RevokeSubscriptionBodySchema = Type.Object({
	subscriptionLink: Type.Optional(Type.String({ minLength: 1 })),
	identityId: Type.Optional(Type.String({ minLength: 1 }))
});

export const RequestSubscriptionBodySchema = Type.Object({
	seed: Type.Optional(
		Type.String({
			minLength: 32,
			description:
				'If left empty the api will generate a seed. Make sure you store the seed since the API will not store it. You can reuse your seed for different channels.'
		})
	),
	accessRights: Type.Optional(Type.Enum(AccessRights)),
	presharedKey: Type.Optional(Type.String({ maxLength: 32, minLength: 32 }))
});

export const RequestSubscriptionResponseSchema = Type.Object({
	seed: Type.String({
		minLength: 32,
		maxLength: 72,
		description:
			'Auto generated seed. Make sure you store the seed since the API will not store it. You can reuse your seed for different channels.'
	}),
	subscriptionLink: Type.String()
});

export const AuthorizeSubscriptionResponseSchema = Type.Object({
	keyloadLink: Type.String()
});
