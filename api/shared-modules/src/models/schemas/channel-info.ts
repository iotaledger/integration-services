import { Type } from '@sinclair/typebox';

export enum ChannelType {
	public = 'public',
	private = 'private'
}

export const TopicSchema = Type.Object({
	type: Type.String(),
	source: Type.String()
});

export const ChannelAddressSchema = Type.String({ minLength: 105, maxLength: 105 });

export const ChannelInfoSchema = Type.Object({
	channelAddress: Type.String({ minLength: 105, maxLength: 105 }),
	name: Type.String({
		description: 'A channel can be searched by its name.'
	}),
	description: Type.Optional(
		Type.String({
			description: 'An optional description of the channel.'
		})
	),
	type: Type.Optional(Type.Enum(ChannelType, { description: 'Channel type used to differ between public and private channels.' })),
	authorId: Type.String({ minLength: 50, maxLength: 53 }),
	subscriberIds: Type.Optional(Type.Array(Type.String({ minLength: 50, maxLength: 53 }))),
	topics: Type.Array(TopicSchema),
	created: Type.Optional(Type.String({ format: 'date-time' })),
	latestMessage: Type.Optional(Type.String({ format: 'date-time' }))
});

export const ChannelInfoSearchSchema = Type.Object({
	authorId: Type.Optional(Type.String()),
	name: Type.Optional(
		Type.String({
			description: 'Optional channel name. A channel can be searched by its name.'
		})
	),
	channelType: Type.Optional(Type.Enum(ChannelType, { description: 'Channel type used to differ between public and private channels.' })),
	topicType: Type.Optional(Type.String()),
	topicSource: Type.Optional(Type.String()),
	created: Type.Optional(Type.String({ format: 'date-time' })),
	latestMessage: Type.Optional(Type.String({ format: 'date-time' })),
	limit: Type.Optional(Type.Number()),
	index: Type.Optional(Type.Number()),
	ascending: Type.Optional(Type.Boolean({ description: 'Sorting the channels by creation date ascending or descending' }))
});

export const ChannelLogRequestOptionsSchema = Type.Object({
	ascending: Type.Boolean(),
	limit: Type.Optional(Type.Number()),
	index: Type.Optional(Type.Number()),
	startDate: Type.Optional(Type.String({ format: 'date-time' })),
	endDate: Type.Optional(Type.String({ format: 'date-time' }))
});
