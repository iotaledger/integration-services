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
		const res = await this.streamsService.create(seed);
		const subscription: Subscription = {
			userId,
			type: SubscriptionType.Author,
			channelAddress: res.announcementLink,
			seed: res.seed,
			subscriptionLink: res.announcementLink,
			state: '',
			accessRights: AccessRights.ReadAndWrite,
			subscriptionIsAuthorized: true
		};
		// Todo use subscription service
		await subscriptionDb.addSubscription(subscription);

		this.channelInfoService.addChannelInfo({
			author: userId,
			channelAddress: res.announcementLink,
			latestLink: res.announcementLink,
			topics: []
		});

		return res;
	};

	addLogs = async (address: string, publicPayload: string, maskedPayload: string, isAuth: boolean): Promise<{ resLink: string; payload: string }> => {
		return this.streamsService.addLogs(address, publicPayload, maskedPayload, isAuth);
	};

	getLogs = async (isAuth: boolean): Promise<{ publicData: any; maskedData: any }> => {
		return this.streamsService.getLogs(isAuth);
	};
}
