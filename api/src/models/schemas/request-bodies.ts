import { Type } from '@sinclair/typebox';
import { AccessRights } from '../types/subscription';
import { TopicSchema } from './channel-info';

export const CreateChannelBodySchema = Type.Object({
	topics: Type.Array(TopicSchema),
	seed: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()]))
});

export const AddChannelLogBodySchema = Type.Object({
	publicPayload: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	maskedPayload: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()]))
});

export const AuthorizeSubscriptionBodySchema = Type.Object({
	subscriptionLink: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	userId: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()]))
});

export const RequestSubscriptionBodySchema = Type.Object({
	seed: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	accessRights: Type.Optional(Type.Union([Type.Enum(AccessRights), Type.Null()]))
});
