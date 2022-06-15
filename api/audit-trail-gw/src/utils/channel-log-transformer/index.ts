import { isEqual } from 'lodash';
import { ChannelData, ChannelLog, ValidateResponse } from '@iota/is-shared-modules';
import { StreamsMessage } from '../../services/streams-service';
import _ from 'lodash';

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
				log: ChannelLogTransformer.getChannelLog(message?.publicPayload, message?.maskedPayload)
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

	static getPayloads(log: ChannelLog): { publicPayload: IPayload; maskedPayload: IPayload } {
		const maskedPayload: IPayload = {
			data: log?.payload
		};
		const publicPayload: IPayload = {
			metadata: log?.metadata,
			type: log?.type,
			data: log?.publicPayload,
			created: log?.created
		};

		return {
			maskedPayload,
			publicPayload
		};
	}

	static validateLogs(logs: ChannelData[], tangleLogs: ChannelData[]): ValidateResponse {
		return logs.map((channelData) => {
			const tangleLog = tangleLogs.find((l) => l.link === channelData.link);

			if (!tangleLog) {
				return {
					link: channelData.link,
					isValid: false,
					error: 'log not found on the tangle'
				};
			}

			const omitedLog = _(channelData.log).omitBy(_.isUndefined).omitBy(_.isNull).value();
			const omitedTangleLog = _(tangleLog.log).omitBy(_.isUndefined).omitBy(_.isNull).value();

			if (!isEqual(omitedLog, omitedTangleLog)) {
				return {
					link: channelData.link,
					isValid: false,
					error: 'not the same data',
					tangleLog: tangleLog.log
				};
			}

			return {
				link: channelData.link,
				isValid: true
			};
		});
	}
}
