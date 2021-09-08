import { isEqual } from 'lodash';
import { ChannelData, ChannelLog } from '../../models/types/channel-data';
import { ValidateResponse } from '../../models/types/request-response-bodies';
import { StreamsMessage } from '../../services/streams-service';

export interface IPayload {
	data?: any;
	metadata?: any;
	created?: any;
	type?: string;
}

export class ChannelLogTransformer {
	static transformStreamsMessages(messages: StreamsMessage[]): ChannelData[] {
		if (!messages || messages.length === 0) {
			return [];
		}
		return messages.map((message) => {
			return {
				link: message?.link,
				messageId: message?.messageId,
				channelLog: ChannelLogTransformer.getChannelLog(message?.publicPayload, message?.maskedPayload)
			};
		});
	}

	static getChannelLog(publicPayload: IPayload, encryptedPayload: IPayload): ChannelLog {
		return {
			type: publicPayload?.type,
			metadata: publicPayload?.metadata,
			created: publicPayload?.created,
			payload: encryptedPayload?.data,
			publicPayload: publicPayload?.data
		};
	}

	static getPayloads(channelLog: ChannelLog): { publicPayload: IPayload; maskedPayload: IPayload } {
		const maskedPayload: IPayload = {
			data: channelLog?.payload
		};
		const publicPayload: IPayload = {
			metadata: channelLog?.metadata,
			type: channelLog?.type,
			data: channelLog?.publicPayload,
			created: channelLog?.created
		};

		return {
			maskedPayload,
			publicPayload
		};
	}

	static validateLogs(logs: ChannelData[], tangleLogs: ChannelData[]): ValidateResponse {
		return logs.map((log) => {
			const tangleLog = tangleLogs.find((l) => l.link === log.link);

			if (!tangleLog) {
				return {
					link: log.link,
					isValid: false,
					error: 'log not found on the tangle'
				};
			}

			if (!isEqual(log.channelLog, tangleLog.channelLog)) {
				return {
					link: log.link,
					isValid: false,
					error: 'not the same data',
					tangleLog: tangleLog.channelLog
				};
			}

			return {
				link: log.link,
				isValid: true
			};
		});
	}
}
