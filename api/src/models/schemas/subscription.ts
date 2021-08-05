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
	type: Type.String(SubscriptionType),
	seed: Type.String(),
	channelAddress: Type.String({ minLength: 10 }), // TODO clarify exact length of channelAddresse to validate them in the schema when starting with the streams integration!
	identityId: Type.String({ minLength: 50, maxLength: 53 }),
	state: Type.String(),
	subscriptionLink: Type.String(),
	isAuthorized: Type.Boolean(),
	accessRights: Type.String(AccessRights),
	publicKey: Type.Optional(Type.String()),
	keyloadLink: Type.Optional(Type.String())
});
