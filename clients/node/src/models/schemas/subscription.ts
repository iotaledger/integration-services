import { Type } from '@sinclair/typebox';

export enum SubscriptionType {
	Author = 'Author',
	Subscriber = 'Subscriber'
}

export enum AccessRights {
	Audit = 'Audit',
	Read = 'Read',
	Write = 'Write',
	ReadAndWrite = 'ReadAndWrite'
}

export const SubscriptionSchema = Type.Object({
	type: Type.Enum(SubscriptionType),
	channelAddress: Type.String({ minLength: 105, maxLength: 105 }),
	identityId: Type.String({ minLength: 50, maxLength: 53 }),
	state: Type.String(),
	subscriptionLink: Type.Optional(Type.String()),
	isAuthorized: Type.Boolean(),
	accessRights: Type.Enum(AccessRights),
	publicKey: Type.Optional(Type.String()),
	keyloadLink: Type.Optional(Type.String()),
	sequenceLink: Type.Optional(Type.String()),
	pskId: Type.Optional(Type.String())
});

export const SubscriptionUpdateSchema = Type.Object({
	type: Type.Optional(Type.Enum(SubscriptionType)),
	channelAddress: Type.Optional(Type.String({ minLength: 105, maxLength: 105 })),
	identityId: Type.Optional(Type.String({ minLength: 50, maxLength: 53 })),
	state: Type.Optional(Type.String()),
	subscriptionLink: Type.Optional(Type.String()),
	isAuthorized: Type.Optional(Type.Boolean()),
	accessRights: Type.Optional(Type.Enum(AccessRights)),
	publicKey: Type.Optional(Type.String()),
	keyloadLink: Type.Optional(Type.String()),
	sequenceLink: Type.Optional(Type.String()),
	pskId: Type.Optional(Type.String())
});
