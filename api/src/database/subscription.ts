import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';
import { Subscription } from '../models/types/subscription';

// Subscription documents keeps information about a subscription a user in regard of a channel
const collectionName = CollectionNames.subscriptions;

const getIndex = (id: string, address: string) => `${id}-${address}`;

export const getSubscription = async (channelAddress: string, userId: string): Promise<Subscription | null> => {
	const query = { _id: getIndex(userId, channelAddress) };
	return MongoDbService.getDocument<Subscription>(collectionName, query);
};

export const addSubscription = async (subscription: Subscription): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
	const document = {
		_id: getIndex(subscription.userId, subscription.channelAddress),
		...subscription,
		creationDate: new Date()
	};

	return MongoDbService.insertDocument(collectionName, document);
};

export const updateSubscriptionState = async (channelAddress: string, userId: string, state: string): Promise<UpdateWriteOpResult> => {
	const query = {
		_id: getIndex(userId, channelAddress)
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
	isAuthorized: boolean
): Promise<UpdateWriteOpResult> => {
	const query = {
		channelAddress,
		subscriptionLink
	};
	const update = {
		$set: {
			isAuthorized,
			lastModified: new Date()
		}
	};

	return MongoDbService.updateDocument(collectionName, query, update);
};
