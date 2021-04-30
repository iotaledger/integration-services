import { StreamsService } from './streams-service';
import * as subscriptionDb from '../database/subscription';
import { AccessRights, Subscription, SubscriptionType } from '../models/types/subscription';
import { ChannelInfoService } from './channel-info-service';

export class ChannelService {
	private readonly streamsService: StreamsService;
	private readonly channelInfoService: ChannelInfoService;

	constructor(streamsService: StreamsService, channelInfoService: ChannelInfoService) {
		this.streamsService = streamsService;
		this.channelInfoService = channelInfoService;
	}
	create = async (userId: string, seed?: string): Promise<{ seed: string; announcementLink: string }> => {
		const createChannel = await this.streamsService.create(seed);
		const subscription: Subscription = {
			userId,
			channelAddress: createChannel.announcementLink,
			seed: createChannel.seed,
			subscriptionLink: createChannel.announcementLink,
			type: SubscriptionType.Author,
			accessRights: AccessRights.ReadAndWrite,
			subscriptionAuthorized: true
		};
		// Todo use subscription service
		await subscriptionDb.addSubscription(subscription);
		console.log('todo use ', this.channelInfoService.addChannelInfo);

		return createChannel;
	};

	addLogs = async (address: string, publicPayload: string, maskedPayload: string): Promise<{ resLink: string; payload: string }> => {
		return this.streamsService.addLogs(address, publicPayload, maskedPayload);
	};

	getLogs = async (): Promise<{ publicData: any; maskedData: any }> => {
		return this.streamsService.getLogs();
	};
}
