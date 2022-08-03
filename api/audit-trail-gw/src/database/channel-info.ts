import { CollectionNames } from './constants';
import { ChannelInfoPersistence, ChannelInfoSearch } from '@iota/is-shared-modules';
import { MongoDbService } from '@iota/is-shared-modules/node';

const collectionName = CollectionNames.channelInfo;

export const getChannelInfo = async (channelAddress: string): Promise<ChannelInfoPersistence> => {
	const query = { _id: channelAddress };
	return await MongoDbService.getDocument<ChannelInfoPersistence>(collectionName, query);
};

export const searchChannelInfo = async (channelInfoSearch: ChannelInfoSearch): Promise<ChannelInfoPersistence[]> => {
	const regex = (text: string) => text && new RegExp(text, 'i');
	const {
		authorId,
		subscriberId,
		requestedSubscriptionId,
		name,
		created,
		latestMessage,
		topicType,
		topicSource,
		limit,
		index,
		ascending,
		hidden
	} = channelInfoSearch;

	const nameFilter = name ? { name: regex(name) } : undefined;
	const authorFilter = authorId ? { authorId: regex(authorId) } : undefined;
	const typeFilter = topicType ? { 'topics.type': { $regex: regex(topicType) } } : undefined;
	const sourceFilter = topicSource ? { 'topics.source': { $regex: regex(topicSource) } } : undefined;
	const subscriberIdsFilter = subscriberId ? { subscriberIds: { $elemMatch: { $eq: subscriberId } } } : undefined;
	const requestedSubscriptionIdsFilter = requestedSubscriptionId
		? { requestedSubscriptionIds: { $elemMatch: { $eq: requestedSubscriptionId } } }
		: undefined;
	const authorFilters = [authorFilter, subscriberIdsFilter, requestedSubscriptionIdsFilter].filter((filter) => filter);
	const channelFilters = [nameFilter, typeFilter, sourceFilter].filter((filter) => filter);

	let filter;
	if (authorFilters.length >= 1 && channelFilters.length >= 1) {
		filter = {
			$and: [
				{ $or: authorFilters },
				{ $or: channelFilters }
			],
		};
	}else{
		const allFilters = [...channelFilters, ...authorFilters]
		filter = {
			$or: allFilters.length >= 1 ? allFilters : undefined
		}
	}
	const query = {
		...filter,
		created: created && { $gte: created },
		latestMessage: latestMessage && { $gte: latestMessage },
		hidden: hidden === true || hidden === false ? hidden : undefined
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

export const updateChannel = async (channelInfo: ChannelInfoPersistence) => {
	const query = {
		_id: channelInfo.channelAddress
	};
	const { topics, hidden, visibilityList } = channelInfo;

	const update = {
		$set: {
			topics,
			hidden,
			visibilityList
		}
	};

	return MongoDbService.updateDocument(collectionName, query, update);
};

export const addChannelRequestedSubscriptionId = async (channelAddress: string, requestedSubscriptionId: string) => {
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
			requestedSubscriptionIds: [...subs, requestedSubscriptionId]
		}
	};

	return MongoDbService.updateDocument(collectionName, query, update);
};

export const removeChannelRequestedSubscriptionId = async (channelAddress: string, requestedSubscriptionId: string) => {
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
			requestedSubscriptionIds: subs.filter((id: string) => id !== requestedSubscriptionId)
		}
	};

	return MongoDbService.updateDocument(collectionName, query, update);
};

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
