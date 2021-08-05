import { Type } from '@sinclair/typebox';
import { TopicSchema } from '../channel-info';

export const CreateChannelBodySchema = Type.Object({
	subscriptionPassword: Type.Optional(Type.String({ minLength: 8 })), // TODO#156 use to decrypt/encrypt data and state
	encrypted: Type.Boolean(),
	topics: Type.Array(TopicSchema),
	hasPresharedKey: Type.Boolean(),
	seed: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	presharedKey: Type.Optional(Type.String({ minLength: 16, maxLength: 16 }))
});

export const CreateChannelBodyResponseSchema = Type.Object({
	seed: Type.Optional(Type.Union([Type.String({ minLength: 1 }), Type.Null()])),
	channelAddress: Type.String({ minLength: 10 }) // TODO clarify exact length of channelAddresse to validate them in the schema when starting with the streams integration!
});

export const AddChannelLogBodySchema = Type.Object({
	type: Type.String({ minLength: 1 }),
	creationDate: Type.Optional(Type.String({ format: 'date-time' })),
	metadata: Type.Optional(Type.Any()),
	payload: Type.Any()
});

export const ChannelDataSchema = Type.Object({
	link: Type.String(),
	channelLog: AddChannelLogBodySchema
});
