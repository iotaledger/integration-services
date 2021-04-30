import { StreamsService } from './streams-service';
import * as subscriptionDb from '../database/subscription';
import { SubscriptionSeed } from '../models/types/subscription';
import { ChannelInfoService } from './channel-info-service';
import { AccessRights } from '../models/schemas/channel-info';

export class ChannelService {
	private readonly streamsService: StreamsService;
	private readonly channelInfoService: ChannelInfoService;

	constructor(streamsService: StreamsService, channelInfoService: ChannelInfoService) {
		this.streamsService = streamsService;
		this.channelInfoService = channelInfoService;
	}
	create = async (userId: string, seed?: string): Promise<{ seed: string; announcementLink: string }> => {
		const res = await this.streamsService.create(seed);
		const subscription: SubscriptionSeed = {
			userId,
			channelAddress: res.announcementLink,
			seed: res.seed,
			subscriptionLink: res.announcementLink
		};
		// Todo use subscription service
		await subscriptionDb.addSubscription(subscription);

		const author = {
			userId,
			accessRights: AccessRights.ReadAndWrite,
			subscriptionLink: res.announcementLink,
			subscriptionIsAuthorized: true
		};
		this.channelInfoService.addChannelInfo({
			author,
			channelAddress: res.announcementLink,
			latestLink: res.announcementLink,
			topics: []
		});

		return res;
	};

	addLogs = async (address: string, publicPayload: string, maskedPayload: string): Promise<{ resLink: string; payload: string }> => {
		return this.streamsService.addLogs(address, publicPayload, maskedPayload);
	};

	getLogs = async (): Promise<{ publicData: any; maskedData: any }> => {
		return this.streamsService.getLogs();
	};
}
