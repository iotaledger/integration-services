import { Type } from '@sinclair/typebox';
import { AccessRights } from '../subscription'
import { TopicSchema } from '../channel-info';

export const CreateChannelBodySchema = Type.Object({
	topics: Type.Array(TopicSchema),
	encrypted: Type.Boolean(),
	seed: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()]))
});

export const CreateChannelBodyResponseSchema = Type.Object({
	seed: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	channelAddress: Type.String({ minLength: 10 }) // TODO clarify exact length of channelAddresse to validate them in the schema when starting with the streams integration!
});

export const AddChannelLogBodySchema = Type.Object({
	type: Type.String({ minLength: 1 }),
	creationDate: Type.Optional(Type.String({format: 'date-time'})),
	metadata: Type.Optional(Type.Any()),
	payload: Type.Any()
});

export const AuthorizeSubscriptionBodySchema = Type.Object({
	subscriptionLink: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	identityId: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()]))
});

export const RequestSubscriptionBodySchema = Type.Object({
	seed: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	accessRights: Type.Optional(Type.Union([Type.Enum(AccessRights), Type.Null()]))
});

export const ChannelDataSchema = Type.Object({
	link: Type.String(),
	channelLog: AddChannelLogBodySchema
});
	

