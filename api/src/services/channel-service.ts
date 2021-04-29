import { StreamsService } from './streams-service';
import * as subscriptionDb from '../database/subscription';
import { AccessRights, Subscription, SubscriptionType } from '../models/types/subscription';

export class ChannelService {
	streamsService: StreamsService;

	constructor(streamsService: StreamsService) {
		this.streamsService = streamsService;
	}
	create = async (userId: string, seed?: string): Promise<{ seed: string; announcementLink: string }> => {
		const createChannel = await this.streamsService.create(seed);
		const subscription: Subscription = {
			userId,
			channelAddress: createChannel.announcementLink,
			seed: createChannel.seed,
			subscriptionLink: createChannel.announcementLink,
			type: SubscriptionType.Author,
			accessRights: AccessRights.ReadAndWrite
		};
		await subscriptionDb.addSubscription(subscription);

		return createChannel;
	};

	addLogs = async (address: string, publicPayload: string, maskedPayload: string): Promise<{ resLink: string; payload: string }> => {
		return this.streamsService.addLogs(address, publicPayload, maskedPayload);
	};

	getLogs = async (): Promise<{ publicData: any; maskedData: any }> => {
		return this.streamsService.getLogs();
	};
}
