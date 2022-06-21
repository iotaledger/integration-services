import { CollectionNames } from './constants';
import { MongoDbService } from '@iota/is-shared-modules/lib/services/mongodb-service';
import { ChannelInfoPersistence, ChannelInfoSearch } from '@iota/is-shared-modules/lib/models/types/channel-info';

const collectionName = CollectionNames.channelInfo;

export const getChannelInfo = async (channelAddress: string): Promise<ChannelInfoPersistence> => {
	const query = { _id: channelAddress };
	return await MongoDbService.getDocument<ChannelInfoPersistence>(collectionName, query);
};

export const searchChannelInfo = async (channelInfoSearch: ChannelInfoSearch): Promise<ChannelInfoPersistence[]> => {
	const regex = (text: string) => text && new RegExp(text, 'i');
	const { authorId, subscriberId, requestedSubscriptionId, name, created, latestMessage, topicType, topicSource, limit, index, ascending } = channelInfoSearch;
	const query = {
		authorId: regex(authorId),
		subscriberIds: subscriberId ? { $elemMatch: { $eq: subscriberId } } : undefined,
	    requestedSubscriptionIds: requestedSubscriptionId ? { $elemMatch: { $eq: requestedSubscriptionId } } : undefined,
		name: regex(name),
		created: created && { $gte: created },
		latestMessage: latestMessage && { $gte: latestMessage },
		'topics.source': regex(topicSource),
		'topics.type': regex(topicType)
	};
	const plainQuery = MongoDbService.getPlainObject(query);
	const sort = ascending != null ? { created: ascending ? 1 : -1 } : undefined;
	const skip = index > 0 ? index * limit : 0;
	const options = limit != null ? { limit, skip, sort } : { sort };

	return await MongoDbService.getDocuments<ChannelInfoPersistence>(collectionName, plainQuery, options);
};

export const addChannelInfo = async (channelInfo: ChannelInfoPersistence) => {
	const document = {
		_id: channelInfo.channelAddress,
		...channelInfo,
		created: new Date()
	};

	const collectionName = CollectionNames.channelInfo;
	return MongoDbService.insertDocument(collectionName, document);
};

export const updateChannelTopic = async (channelInfo: ChannelInfoPersistence) => {
	const query = {
		_id: channelInfo.channelAddress
	};
	const { topics } = channelInfo;
	const update = {
		$set: {
			topics
		}
	};

	return MongoDbService.updateDocument(collectionName, query, update);
};

export const addChannelRequestSubscriberId = async (channelAddress: string, subscriberId: string) => {
	const currChannel = await getChannelInfo(channelAddress);
	if (!currChannel) {
		throw new Error(`could not find channel with address ${channelAddress}`);
	}
	const subs = currChannel?.requestedSubscriptionIds || [];
	const query = {
		_id: channelAddress
	};
	const update = {
		$set: {
			requestedSubscriptionIds: [...subs, subscriberId]
		}
	};

	return MongoDbService.updateDocument(collectionName, query, update);
};

export const removeChannelRequestSubscriberId = async (channelAddress: string, subscriberId: string) => {
	const currChannel = await getChannelInfo(channelAddress);
	if (!currChannel) {
		throw new Error(`could not find channel with address ${channelAddress}`);
	}
	const subs = currChannel?.requestedSubscriptionIds || [];
	const query = {
		_id: channelAddress
	};
	const update = {
		$set: {
			requestedSubscriptionIds: subs.filter((subscriber: string) => subscriber !== subscriberId)
		}
	};

	return MongoDbService.updateDocument(collectionName, query, update);
}

export const addChannelSubscriberId = async (channelAddress: string, subscriberId: string) => {
	const currChannel = await getChannelInfo(channelAddress);
	if (!currChannel) {
		throw new Error(`could not find channel with address ${channelAddress}`);
	}
	const subs = currChannel?.subscriberIds || [];
	const query = {
		_id: channelAddress
	};
	const update = {
		$set: {
			subscriberIds: [...subs, subscriberId]
		}
	};

	return MongoDbService.updateDocument(collectionName, query, update);
};

export const removeChannelSubscriberId = async (channelAddress: string, subscriberId: string) => {
	const currChannel = await getChannelInfo(channelAddress);
	if (!currChannel) {
		throw new Error(`could not find channel with address ${channelAddress}`);
	}
	const subs = currChannel?.subscriberIds || [];
	const query = {
		_id: channelAddress
	};
	const update = {
		$set: {
			subscriberIds: subs.filter((s) => s !== subscriberId)
		}
	};

	return MongoDbService.updateDocument(collectionName, query, update);
};

export const deleteChannelInfo = async (channelAddress: string) => {
	const query = { _id: channelAddress };
	return MongoDbService.removeDocument(collectionName, query);
};
