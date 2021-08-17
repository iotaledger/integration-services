import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { ChannelData } from '../models/types/channel-data';

const collectionName = CollectionNames.channelData;
const getIndex = (link: string, identityId: string) => `${link}-${identityId}`;

export const getChannelData = async (channelAddress: string, identityId: string, limit?: number, index?: number): Promise<ChannelData[]> => {
	const query = { channelAddress, identityId };
	const skip = index > 0 ? index * limit : 0;
	const options = limit != null ? { limit, skip, sort: { creationDate: 1 } } : undefined;

	const channelDataArr = await MongoDbService.getDocuments<ChannelData>(collectionName, query, options);
	return channelDataArr.map(({ link, channelLog, messageId }) => ({ link, channelLog, messageId }));
};

export const addChannelData = async (channelAddress: string, identityId: string, channelData: ChannelData[]): Promise<void> => {
	const documents = channelData.map((data) => {
		return {
			_id: getIndex(data.link, identityId),
			channelAddress,
			identityId,
			...data
		};
	});

	const res = await MongoDbService.insertDocuments(collectionName, documents);
	if (!res?.result?.n) {
		throw new Error('could not add channel data!');
	}
};
