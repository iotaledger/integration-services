import { Type } from '@sinclair/typebox';

export const TopicSchema = Type.Object({
	type: Type.String(),
	source: Type.String()
});

export enum AccessRights {
	Read = 'Read',
	Write = 'Write',
	ReadAndWrite = 'ReadAndWrite'
}

export const ChannelSubscriptionSchema = Type.Object({
	userId: Type.String(),
	subscriptionIsAuthorized: Type.Boolean(),
	subscriptionLink: Type.String(),
	accessRights: Type.Enum(AccessRights)
});

export const ChannelInfoSchema = Type.Object({
	channelAddress: Type.String({ minLength: 10 }), // TODO clarify exact length of channelAddresse to validate them in the schema when starting with the streams integration!
	author: ChannelSubscriptionSchema,
	subscribers: Type.Optional(Type.Array(ChannelSubscriptionSchema)),
	latestLink: Type.String(),
	topics: Type.Array(TopicSchema),
	created: Type.Optional(Type.String()),
	latestMessage: Type.Optional(Type.String())
});
