import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';
import { Subscription } from '../models/types/subscription';

// Subscription documents keeps information about a subscription a user in regard of a channel
const collectionName = CollectionNames.subscriptions;

const getIndex = (id: string, address: string) => `${id}-${address}`;

export const getSubscriptions = async (channelAddress: string): Promise<Subscription[] | null> => {
	const query = { channelAddress };
	return MongoDbService.getDocuments<Subscription>(collectionName, query);
};

export const getSubscriptionsByAuthorization = async(channelAddress: string, isAuthorized?: boolean): Promise<Subscription[] | null> => {
	const query: any = { channelAddress };
	if (isAuthorized !== undefined) query['isAuthorized'] = isAuthorized;
	return MongoDbService.getDocuments<Subscription>(collectionName, query);
}

export const getSubscriptionByIdentity = async(channelAddress: string, identityId: string): Promise<Subscription | null> => {
	const query = { channelAddress, identityId };
	return MongoDbService.getDocument<Subscription>(collectionName, query);
}

export const getSubscription = async (channelAddress: string, identityId: string): Promise<Subscription | null> => {
	const query = { _id: getIndex(identityId, channelAddress) };
	return MongoDbService.getDocument<Subscription>(collectionName, query);
};

export const getSubscriptionByLink = async (subscriptionLink: string): Promise<Subscription | null> => {
	const query = { subscriptionLink };
	return MongoDbService.getDocument<Subscription>(collectionName, query);
};

export const addSubscription = async (subscription: Subscription): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
	const document = {
		_id: getIndex(subscription.identityId, subscription.channelAddress),
		...subscription,
		created: new Date()
	};

	return MongoDbService.insertDocument(collectionName, document);
};

export const updateSubscriptionState = async (channelAddress: string, identityId: string, state: string): Promise<UpdateWriteOpResult> => {
	const query = {
		_id: getIndex(identityId, channelAddress)
	};
	const update = {
		$set: {
			state,
			lastModified: new Date()
		}
	};

	return MongoDbService.updateDocument(collectionName, query, update);
};

export const setSubscriptionAuthorization = async (
	channelAddress: string,
	subscriptionLink: string,
	isAuthorized: boolean,
	keyloadLink?: string
): Promise<UpdateWriteOpResult> => {
	const query = {
		channelAddress,
		subscriptionLink
	};
	const update = {
		$set: {
			isAuthorized,
			keyloadLink,
			lastModified: new Date()
		}
	};

	return MongoDbService.updateDocument(collectionName, query, update);
};
