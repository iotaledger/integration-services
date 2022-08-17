import { CollectionNames } from './constants';
import { MongoDbService } from '@iota/is-shared-modules/node';
import { SubscriptionState } from '../../../shared-modules/src/web/models/types/subscription';

// Subscription state documents keeps information about the state of a channel subscription per user
const collectionName = CollectionNames.subscriptionStates;

const getIndex = (id: string, address: string) => `${id}-${address}`;

export const getSubscriptionState = async (channelAddress: string, id: string): Promise<SubscriptionState | null> => {
	const query = { channelAddress, id };
	return MongoDbService.getDocument<SubscriptionState>(collectionName, query);
};

export const addSubscription = async (channelAddress: string, id: string, state: string) => {
	const document = {
		_id: getIndex(id, channelAddress),
		channelAddress,
		id,
		state,
		created: new Date()
	};

	return MongoDbService.insertDocument(collectionName, document);
};

export const updateSubscriptionState = async (channelAddress: string, id: string, state: string) => {
	const query = { _id: getIndex(id, channelAddress) };
	const plainUpdate = MongoDbService.getPlainObject({
		channelAddress,
		id,
		state,
		lastModified: new Date()
	});

	const update = {
		$set: { ...plainUpdate }
	};
	return MongoDbService.updateDocument(collectionName, query, update);
};

export const removeSubscriptionState = async (channelAddress: string, id: string) => {
	const query = { _id: getIndex(id, channelAddress) };
	return MongoDbService.removeDocument(collectionName, query);
};
