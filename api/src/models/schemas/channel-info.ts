import { Type } from '@sinclair/typebox';

export const TopicSchema = Type.Object({
	type: Type.String(),
	source: Type.String()
});

export const ChannelAddressSchema = Type.String({ minLength: 105, maxLength: 105 });

export const ChannelInfoSchema = Type.Object({
	channelAddress: Type.String({ minLength: 105, maxLength: 105 }),
	authorId: Type.String({ minLength: 50, maxLength: 53 }),
	subscriberIds: Type.Optional(Type.Array(Type.String({ minLength: 50, maxLength: 53 }))),
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
});

export const ChannelLogRequestOptionsSchema = Type.Object({
	ascending: Type.Boolean(),
	limit: Type.Optional(Type.Number()),
	index: Type.Optional(Type.Number()),
	startDate: Type.Optional(Type.String({format: 'date-time'})),
	endDate: Type.Optional(Type.String({format: 'date-time'}))
})