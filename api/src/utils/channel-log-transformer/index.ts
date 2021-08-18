import { isEmpty } from 'lodash';
import { ChannelData, ChannelLog } from '../../models/types/channel-data';
import { StreamsMessage } from '../../services/streams-service';

export interface IPayload {
	data?: any;
	metadata?: any;
	creationDate?: any;
	type?: string;
}

export class ChannelLogTransformer {
	static transformStreamsMessages(data: StreamsMessage[]): ChannelData[] {
		return data.map((data) => {
			return {
				link: data.link,
				messageId: data.messageId,
				channelLog: ChannelLogTransformer.getChannelLog(data.publicPayload, data.maskedPayload)
			};
		});
	}

	static getChannelLog(publicPayload: IPayload, encryptedPayload: IPayload): ChannelLog {
		const hasPublicPayload = !isEmpty(publicPayload.data);
		return {
			type: hasPublicPayload ? publicPayload.type : encryptedPayload.type,
			metadata: publicPayload.metadata,
			creationDate: hasPublicPayload ? publicPayload.creationDate : encryptedPayload.creationDate,
			payload: encryptedPayload.data,
			publicPayload: publicPayload.data
		};
	}

	static getPayloads(channelLog: ChannelLog): { publicPayload: IPayload; maskedPayload: IPayload } {
		let maskedPayload: IPayload = {
			data: channelLog.payload
		};
		let publicPayload: IPayload = {
			metadata: channelLog.metadata
		};

		if (channelLog.publicPayload) {
			publicPayload = {
				...publicPayload,
				data: channelLog.publicPayload,
				type: channelLog.type,
				creationDate: channelLog.creationDate
			};
		} else {
			maskedPayload = {
				...maskedPayload,
				type: channelLog.type,
				creationDate: channelLog.creationDate
			};
		}
		return {
			maskedPayload,
			publicPayload
		};
	}
}
