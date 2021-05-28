import { Type } from '@sinclair/typebox';
import { AccessRights } from '../types/subscription';
import { TopicSchema } from './channel-info';

export const ProveOwnershipPostBodySchema = Type.Object({
	signedNonce: Type.String({ minLength: 128, maxLength: 128 })
});

export const CreateChannelBodySchema = Type.Object({
	topics: Type.Array(TopicSchema),
	encrypted: Type.Boolean(),
	seed: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()]))
});

export const AddChannelLogBodySchema = Type.Object({
	type: Type.String({ minLength: 1 }),
	creationDate: Type.Optional(Type.String()),
	metadata: Type.Optional(Type.Any()),
	payload: Type.Any()
});

export const AuthorizeSubscriptionBodySchema = Type.Object({
	subscriptionLink: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	userId: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()]))
});

export const RequestSubscriptionBodySchema = Type.Object({
	seed: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	accessRights: Type.Optional(Type.Union([Type.Enum(AccessRights), Type.Null()]))
});
