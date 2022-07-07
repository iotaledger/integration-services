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
	hidden: Type.Optional(Type.Boolean({default: false, description: 'If set to true the channel can not be found by others. It will be still possible to give specific users access to the channel.'})),
	visibilityList: Type.Optional(Type.Array(Type.Object({id: Type.String()}))),
	type: Type.Optional(Type.Enum(ChannelType, { description: 'Channel type used to differ between public and private channels.' })),
	authorId: Type.String({ minLength: 50, maxLength: 53 }),
	subscriberIds: Type.Optional(Type.Array(Type.String({ minLength: 50, maxLength: 53 }))),
	requestedSubscriptionIds: Type.Optional(Type.Array(Type.String({minLength: 50, maxLength: 53}))),
	topics: Type.Array(TopicSchema),
	created: Type.Optional(Type.String({ format: 'date-time' })),
	latestMessage: Type.Optional(Type.String({ format: 'date-time' }))
});

export const ChannelInfoSearchSchema = Type.Object({
	authorId: Type.Optional(Type.String()),
	subscriberId: Type.Optional(Type.String()), 
	requestedSubscriptionId: Type.Optional(Type.String()),
	name: Type.Optional(
		Type.String({
			description: 'Optional channel name. A channel can be searched by its name.'
		})
	),
	hidden: Type.Optional(Type.Boolean({default: false, description: 'Channels which are hidden to others.'})),
	visibilityList: Type.Optional(Type.Array(Type.Object({id: Type.String()}))),
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
