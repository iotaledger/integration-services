export enum SubscriptionType {
	Author = 'Author',
	Subscriber = 'Subscriber'
}

export enum AccessRights {
	Read = 'Read',
	Write = 'Write',
	ReadAndWrite = 'ReadAndWrite'
}
export interface Subscription {
	type: SubscriptionType;
	seed: string;
	channelAddress: string;
	userId: string;
	state: string;
	isAuthorized: boolean;
	subscriptionLink: string;
	accessRights: AccessRights;
}
