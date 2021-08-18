import { isEmpty } from 'lodash';
import { ChannelData, ChannelLog } from '../../models/types/channel-data';
import { StreamsData } from '../../services/streams-service';

export interface IPayload {
	payload?: any;
	metadata?: any;
	creationDate?: any;
	type?: string;
}

export class ChannelLogTransformer {
	static transformStreamsData(data: StreamsData[]): ChannelData[] {
		return data.map((data) => {
			return {
				link: data.link,
				messageId: data.messageId,
				channelLog: ChannelLogTransformer.getChannelLog(data.publicPayload, data.maskedPayload)
			};
		});
	}

	static getChannelLog(publicPayload: IPayload, encryptedPayload: IPayload): ChannelLog {
		const hasPublicPayload = !isEmpty(publicPayload.payload);
		return {
			type: hasPublicPayload ? publicPayload.type : encryptedPayload.type,
			metadata: publicPayload.metadata,
			creationDate: hasPublicPayload ? publicPayload.creationDate : encryptedPayload.creationDate,
			payload: encryptedPayload.payload,
			publicPayload: publicPayload.payload
		};
	}

	static getPayloads(channelLog: ChannelLog) {
		let encryptedData: IPayload = {
			payload: channelLog.payload
		};
		let publicData: IPayload = {
			metadata: channelLog.metadata
		};

		if (channelLog.publicPayload) {
			publicData = {
				...publicData,
				payload: channelLog.publicPayload,
				type: channelLog.type
			};
		} else {
			encryptedData = {
				...encryptedData,
				type: channelLog.type
			};
		}
		return {
			encryptedData,
			publicData
		};
	}
}
