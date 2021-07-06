import { Type } from '@sinclair/typebox';

export const TopicSchema = Type.Object({
	type: Type.String(),
	source: Type.String()
});

export const ChannelAddressSchema = Type.String({ minLength: 10 }); // TODO clarify exact length of channelAddresse to validate them in the schema when starting with the streams integration!

export const ChannelInfoSchema = Type.Object({
	channelAddress: Type.String({ minLength: 10 }), // TODO clarify exact length of channelAddresse to validate them in the schema when starting with the streams integration!
	authorId: Type.String({ minLength: 50, maxLength: 53 }),
	subscriberIds: Type.Optional(Type.Array(Type.String({ minLength: 50, maxLength: 53 }))),
	latestLink: Type.String(),
	encrypted: Type.Boolean(),
	topics: Type.Array(TopicSchema),
	created: Type.Optional(Type.String({ format: 'date-time' })),
	latestMessage: Type.Optional(Type.String({ format: 'date-time' }))
});

export const ChannelInfoSearchSchema = Type.Object({
	authorId: Type.Optional(Type.String()),
	author: Type.Optional(Type.String()),
	topicType: Type.Optional(Type.String()),
	topicSource: Type.Optional(Type.String()),
	created: Type.Optional(Type.String({ format: 'date-time' })),
	latestMessage: Type.Optional(Type.String({ format: 'date-time' })),
	limit: Type.Optional(Type.Number()),
	index: Type.Optional(Type.Number())
})
