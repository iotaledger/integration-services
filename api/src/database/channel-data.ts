import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { ChannelData } from '../models/types/channel-data';
import { getDateStringFromDate } from '../utils/date';
import { ChannelLogRequestOptions } from '../models/types/channel-info';
import { decrypt, encrypt } from '../utils/encryption';

const collectionName = CollectionNames.channelData;
const getIndex = (link: string, identityId: string) => `${link}-${identityId}`;

export const getChannelData = async (
	channelAddress: string,
	identityId: string,
	options: ChannelLogRequestOptions,
	secret: string
): Promise<ChannelData[]> => {
	const { ascending, index, limit, startDate, endDate } = options;

	const startFilter = startDate ? { $gte: startDate } : {};
	const endFilter = endDate ? { $lte: endDate } : {};
	const createdFilter = startDate || endDate ? { 'log.created': { ...startFilter, ...endFilter } } : {};
	const query = {
		channelAddress,
		identityId,
		...createdFilter
	};
	const skip = index > 0 ? index * limit : 0;
	const sort = { 'log.created': ascending ? 1 : -1 };
	const opt = limit != null ? { limit, skip, sort } : { sort };

	const channelDataArr = await MongoDbService.getDocuments<ChannelData>(collectionName, query, opt);
	return channelDataArr.map(({ link, log, messageId, imported }) => {
		const decryptedLog = {
			...log,
			payload: JSON.parse(decrypt(log.payload, secret))
		};
		return { link, log: decryptedLog, messageId, imported };
	});
};

export const addChannelData = async (
	channelAddress: string,
	identityId: string,
	channelData: ChannelData[],
	secret: string
): Promise<void> => {
	const imported = getDateStringFromDate(new Date());

	const documents = channelData.map((data) => {
		const encryptedPayload = encrypt(JSON.stringify(data.log.payload), secret);
		return {
			_id: getIndex(data.link, identityId),
			channelAddress,
			identityId,
			imported,
			link: data.link,
			messageId: data.messageId,
			log: {
				...data.log,
				payload: encryptedPayload
			}
		};
	});

	const res = await MongoDbService.insertDocuments(collectionName, documents);
	if (!res?.result?.n) {
		throw new Error('could not add channel data!');
	}
};

export const removeChannelData = async (channelAddress: string, identityId: string): Promise<void> => {
	const query = { channelAddress, identityId };
	await MongoDbService.removeDocuments(collectionName, query);
};
