import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { ChannelData } from '../models/types/channel-data';
import { getDateStringFromDate } from '../utils/date';

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
	const sort = { 'log.created': ascending ? 1 : -1 };
	const opt = limit != null ? { limit, skip, sort } : { sort };

	const channelDataArr = await MongoDbService.getDocuments<ChannelData>(collectionName, query, opt);
	return channelDataArr.map(({ link, log, messageId, imported }) => ({ link, log, messageId, imported }));
};

export const addChannelData = async (channelAddress: string, identityId: string, channelData: ChannelData[], _secret: string): Promise<void> => {
	const imported = getDateStringFromDate(new Date());

	const documents = channelData.map((data) => {
		// TODO encrypt but only encrypted payload
		// const encryptedData = encrypt(JSON.stringify(data), secret);

		return {
			...data,
			_id: getIndex(data.link, identityId),
			channelAddress,
			identityId,
			imported
		};
	});

	const res = await MongoDbService.insertDocuments(collectionName, documents);
	if (!res?.result?.n) {
		throw new Error('could not add channel data!');
	}
};

export const deleteChannelData = async (channelAddress: string, identityId: string): Promise<void> => {
	const query = { channelAddress, identityId };
	await MongoDbService.removeDocuments(collectionName, query);
};
