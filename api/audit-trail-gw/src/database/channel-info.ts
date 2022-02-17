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
	const { authorId, created, latestMessage, topicType, topicSource, limit, index } = channelInfoSearch;
	const query = {
		authorId: regex(authorId),
		created: created && { $gte: created },
		latestMessage: latestMessage && { $gte: latestMessage },
		'topics.source': regex(topicSource),
		'topics.type': regex(topicType)
	};
	const plainQuery = MongoDbService.getPlainObject(query);
	const skip = index > 0 ? index * limit : 0;
	const options = limit != null ? { limit, skip } : undefined;

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

export const deleteChannelInfo = async (channelAddress: string) => {
	const query = { _id: channelAddress };
	return MongoDbService.removeDocument(collectionName, query);
};
