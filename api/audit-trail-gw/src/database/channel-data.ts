import { CollectionNames } from './constants';
import { MongoDbService } from '@iota-is/shared-modules/lib/services/mongodb-service';
import { ChannelData } from '@iota-is/shared-modules/lib/models/types/channel-data';
import { getDateStringFromDate } from '@iota-is/shared-modules/lib/utils/text';
import { ChannelLogRequestOptions } from '@iota-is/shared-modules/lib/models/types/channel-info';
import { decrypt, encrypt } from '@iota-is/shared-modules/lib/utils/encryption';
import * as _ from 'lodash';

const collectionName = CollectionNames.channelData;
const getIndex = (link: string, id: string) => `${link}-${id}`;

export const getChannelData = async (
	channelAddress: string,
	id: string,
	options: ChannelLogRequestOptions,
	secret: string
): Promise<ChannelData[]> => {
	const { ascending, index, limit, startDate, endDate } = options;

	const startFilter = startDate ? { $gte: startDate } : {};
	const endFilter = endDate ? { $lte: endDate } : {};
	const createdFilter = startDate || endDate ? { 'log.created': { ...startFilter, ...endFilter } } : {};
	const query = {
		channelAddress,
		id,
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

export const addChannelData = async (channelAddress: string, id: string, channelData: ChannelData[], secret: string): Promise<void> => {
	const imported = getDateStringFromDate(new Date());

	const documents = channelData.map((data) => {
		const encryptedPayload = encrypt(JSON.stringify(data.log.payload), secret);
		return {
			_id: getIndex(data.link, id),
			channelAddress,
			id,
			imported,
			link: data.link,
			messageId: data.messageId,
			log: {
				..._.omitBy(data.log, _.isUndefined),
				payload: encryptedPayload
			}
		};
	});

	const res = await MongoDbService.insertDocuments(collectionName, documents);
	if (!res?.result?.n) {
		throw new Error('could not add channel data!');
	}
};

export const removeChannelData = async (channelAddress: string, id: string): Promise<void> => {
	const query = { channelAddress, id };
	await MongoDbService.removeDocuments(collectionName, query);
};
