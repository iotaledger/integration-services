import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { InsertOneWriteOpResult, WithId } from 'mongodb';
import { SubscriptionSeed } from '../models/types/subscription';

// Subscription documents keeps the mapping between channel -> seed -> userId
const collectionName = CollectionNames.subscriptions;

const getIndex = (id: string, address: string) => `${id}-${address}`;

export const getSubscription = async (userId: string, channelAddress: string): Promise<SubscriptionSeed | null> => {
	const query = { _id: getIndex(userId, channelAddress) };
	return await MongoDbService.getDocument<SubscriptionSeed>(collectionName, query);
};

export const addSubscription = async (subscription: SubscriptionSeed): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
	const document = {
		_id: getIndex(subscription.userId, subscription.channelAddress),
		...subscription,
		creationDate: new Date()
	};

	return MongoDbService.insertDocument(collectionName, document);
};
