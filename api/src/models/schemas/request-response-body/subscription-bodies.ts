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
	subscriptionPassword: Type.Optional(
		Type.String({
			minLength: 8,
			description:
				'If a subscriptionPassword is set, all data is encrypted with the password. It need to be made sure, the subscription password is sent when interacting with the APIs of the channel-service and subscription-service.'
		})
	), // TODO#156 use to decrypt/encrypt data and state
	seed: Type.Optional(Type.Union([Type.String({ minLength: 1, description: 'If left empty the api will generate a seed.' }), Type.Null()])),
	accessRights: Type.Optional(Type.Union([Type.Enum(AccessRights), Type.Null()])),
	presharedKey: Type.Optional(Type.String({ maxLength: 32, minLength: 32 }))
});

export const RequestSubscriptionResponseSchema = Type.Object({
	seed: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
	subscriptionLink: Type.String()
});

export const AuthorizeSubscriptionResponseSchema = Type.Object({
	keyloadLink: Type.String()
});
