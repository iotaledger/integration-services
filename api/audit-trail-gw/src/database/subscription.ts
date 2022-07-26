import { CollectionNames } from './constants';
import { Subscription, SubscriptionUpdate } from '@iota/is-shared-modules';
import { MongoDbService } from '@iota/is-shared-modules/node';

// Subscription documents keeps information about a subscription a user in regard of a channel
const collectionName = CollectionNames.subscriptions;

const getIndex = (id: string, address: string) => `${id}-${address}`;

export const getSubscriptions = async (channelAddress: string): Promise<Subscription[] | null> => {
	const query = { channelAddress };
	return MongoDbService.getDocuments<Subscription>(collectionName, query);
};

export const getSubscriptionsByAuthorization = async (channelAddress: string, isAuthorized?: boolean): Promise<Subscription[] | null> => {
	const query: any = { channelAddress };
	if (isAuthorized != null) {
		query['isAuthorized'] = isAuthorized;
	}
	return MongoDbService.getDocuments<Subscription>(collectionName, query);
};

export const getSubscription = async (channelAddress: string, id: string): Promise<Subscription | null> => {
	const query = { _id: getIndex(id, channelAddress) };
	return MongoDbService.getDocument<Subscription>(collectionName, query);
};

export const getSubscriptionByLink = async (subscriptionLink: string): Promise<Subscription | null> => {
	const query = { subscriptionLink };
	return MongoDbService.getDocument<Subscription>(collectionName, query);
};

export const getSubscriptionByPublicKey = async (channelAddress: string, publicKey: string): Promise<Subscription | null> => {
	const query = { channelAddress, publicKey };
	return MongoDbService.getDocument<Subscription>(collectionName, query);
};

export const addSubscription = async (subscription: Subscription) => {
	const document = {
		_id: getIndex(subscription.id, subscription.channelAddress),
		...subscription,
		created: new Date()
	};

	return MongoDbService.insertDocument(collectionName, document);
};

export const updateSubscription = async (channelAddress: string, id: string, subscriptionUpdate: SubscriptionUpdate) => {
	const query = { _id: getIndex(id, channelAddress) };
	// updates on channelAddress, publicKey, id and type are not allowed
	const { state, subscriptionLink, isAuthorized, accessRights, keyloadLink, sequenceLink, pskId } = subscriptionUpdate;
	const plainUpdate = MongoDbService.getPlainObject({
		state,
		subscriptionLink,
		isAuthorized,
		accessRights,
		keyloadLink,
		sequenceLink,
		pskId
	});

	const update = {
		$set: { ...plainUpdate }
	};
	return MongoDbService.updateDocument(collectionName, query, update);
};

export const removeSubscription = async (channelAddress: string, id: string) => {
	const query = { _id: getIndex(id, channelAddress) };
	return MongoDbService.removeDocument(collectionName, query);
};

export const updateSubscriptionState = async (channelAddress: string, id: string, state: string) => {
	const query = {
		_id: getIndex(id, channelAddress)
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
	id: string,
	isAuthorized: boolean,
	keyloadLink: string,
	sequenceLink: string
) => {
	const query = {
		channelAddress,
		id
	};
	const update = {
		$set: {
			isAuthorized,
			keyloadLink,
			lastModified: new Date(),
			sequenceLink
		}
	};

	return MongoDbService.updateDocument(collectionName, query, update);
};
