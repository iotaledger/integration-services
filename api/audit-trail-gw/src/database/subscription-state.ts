import { CollectionNames } from './constants';
import { MongoDbService } from '@iota/is-shared-modules/node';
import { SubscriptionState } from '@iota/is-shared-modules/';

// Subscription state documents keeps information about the state of a channel subscription per user
const collectionName = CollectionNames.subscriptionStates;

const getIndex = (id: string, address: string) => `${id}-${address}`;

export const getSubscriptionState = async (channelAddress: string, id: string): Promise<string | null> => {
	const query = { channelAddress, id };
	const doc = await MongoDbService.getDocument<SubscriptionState>(collectionName, query);
	if (!doc?.state) {
		throw new Error(`could not find state of channel with with address ${channelAddress} and id ${id}`);
	}

	return doc.state;
};

export const addSubscriptionState = async (channelAddress: string, id: string, state: string) => {
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
	const res = await MongoDbService.updateDocument(collectionName, query, update);
	if (res?.result?.n !== 1) {
		throw Error('no subscription found to update!');
	}
};

export const removeSubscriptionState = async (channelAddress: string, id: string) => {
	const query = { _id: getIndex(id, channelAddress) };
	return MongoDbService.removeDocument(collectionName, query);
};
