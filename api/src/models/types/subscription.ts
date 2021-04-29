export const enum SubscriptionType {
	Author = 'Author',
	Subscriber = 'Subscriber'
}
export const enum AccessRights {
	Read = 'Read',
	Write = 'Write',
	ReadAndWrite = 'ReadAndWrite'
}
export interface Subscription {
	seed: string;
	channelAddress: string;
	subscriptionLink: string;
	userId: string;
	type: SubscriptionType;
	accessRights: AccessRights;
}
