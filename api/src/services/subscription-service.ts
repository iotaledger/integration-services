import { StreamsService } from './streams-service';
import * as subscriptionDb from '../database/subscription';
import { SubscriptionSeed } from '../models/types/subscription';
import { ChannelInfoService } from './channel-info-service';
import { AccessRights } from '../models/schemas/channel-info';
import { ChannelSubscription } from '../models/types/channel-info';

export class SubscriptionService {
	streamsService: StreamsService;
	private readonly channelInfoService: ChannelInfoService;

	constructor(streamsService: StreamsService, channelInfoService: ChannelInfoService) {
		this.streamsService = streamsService;
		this.channelInfoService = channelInfoService;
	}

	getSubscriptions = async (announcementLink: string): Promise<void> => {
		return this.streamsService.getSubscriptions(announcementLink);
	};

	requestSubscription = async (
		userId: string,
		channelAddress: string,
		seed?: string,
		accessRights?: AccessRights
	): Promise<{ seed: string; subLink: string }> => {
		// TODO check seed size == 81 if not null
		const res = await this.streamsService.requestSubscription(channelAddress, seed);
		const subscription: SubscriptionSeed = {
			userId,
			channelAddress: channelAddress,
			seed: res.seed,
			subscriptionLink: res.subLink
		};
		await subscriptionDb.addSubscription(subscription);
		const channelSubscription: ChannelSubscription = {
			accessRights,
			subscriptionLink: res.subLink,
			subscriptionIsAuthorized: false,
			userId
		};
		await this.channelInfoService.addChannelSubscriber(channelAddress, channelSubscription);
		return res;
	};

	authorizeSubscription = async (subscriptionLink: string, announcementLink: string): Promise<void> => {
		const authSub = this.streamsService.authorizeSubscription(subscriptionLink, announcementLink);
		// Todo update channel info
		return authSub;
	};
}
