import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { ChannelData } from '../models/types/channel-data';

const collectionName = CollectionNames.channelData;

export const getChannelData = async (channelAddress: string, limit?: number, index?: number): Promise<any> => {
	const query = { _id: channelAddress };
	const skip = index > 0 ? (index - 1) * limit : 0;
	const options = limit != null ? { limit, skip } : undefined;

	return await MongoDbService.getDocuments<any>(collectionName, query, options);
};

export const addChannelData = async (channelData: ChannelData[]): Promise<void> => {
	const documents = channelData.map((data) => {
		return {
			_id: data.link,
			...data
		};
	});

	const res = await MongoDbService.insertDocuments(collectionName, documents);
	if (!res?.result?.n) {
		throw new Error('could not add channel data!');
	}
};
