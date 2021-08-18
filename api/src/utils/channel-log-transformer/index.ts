import { ChannelData, ChannelLog } from '../../models/types/channel-data';
import { StreamsMessage } from '../../services/streams-service';

export interface IPayload {
	data?: any;
	metadata?: any;
	created?: any;
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
		return {
			type: publicPayload.type,
			metadata: publicPayload.metadata,
			created: publicPayload.created,
			payload: encryptedPayload.data,
			publicPayload: publicPayload.data
		};
	}

	static getPayloads(channelLog: ChannelLog): { publicPayload: IPayload; maskedPayload: IPayload } {
		const maskedPayload: IPayload = {
			data: channelLog.payload
		};
		const publicPayload: IPayload = {
			metadata: channelLog.metadata,
			type: channelLog.type,
			data: channelLog.publicPayload,
			created: channelLog.created
		};

		return {
			maskedPayload,
			publicPayload
		};
	}
}
