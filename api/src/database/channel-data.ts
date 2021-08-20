import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { ChannelData } from '../models/types/channel-data';

const collectionName = CollectionNames.channelData;
const getIndex = (link: string, identityId: string) => `${link}-${identityId}`;

export const getChannelData = async (
	channelAddress: string,
	identityId: string,
	options: { limit?: number; index?: number; ascending: boolean }
): Promise<ChannelData[]> => {
	const { ascending, index, limit } = options;

	const query = { channelAddress, identityId };
	const skip = index > 0 ? index * limit : 0;
	const sort = { 'channelLog.created': ascending ? 1 : -1 };
	const opt = limit != null ? { limit, skip, sort } : { sort };

	const channelDataArr = await MongoDbService.getDocuments<ChannelData>(collectionName, query, opt);
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
