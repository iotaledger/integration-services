import { StreamsService } from './streams-service';
import * as subscriptionDb from '../database/subscription';
import { AccessRights, Subscription, SubscriptionType } from '../models/types/subscription';
import { ChannelInfoService } from './channel-info-service';

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
		subscriberId: string,
		channelAddress: string,
		seed?: string,
		accessRights?: AccessRights
	): Promise<{ seed: string; subscriptionLink: string }> => {
		// TODO check seed size == 81 if not null
		const res = await this.streamsService.requestSubscription(channelAddress, seed);
		const subscription: Subscription = {
			type: SubscriptionType.Subscriber,
			userId: subscriberId,
			channelAddress: channelAddress,
			seed: res.seed,
			subscriptionLink: res.subscriptionLink,
			accessRights,
			subscriptionIsAuthorized: false,
			state: ''
		};

		await subscriptionDb.addSubscription(subscription);
		await this.channelInfoService.addChannelSubscriber(channelAddress, subscriberId);
		await this.channelInfoService.updateLatestChannelLink(channelAddress, res.subscriptionLink);
		return res;
	};

	authorizeSubscription = async (subscriptionLink: string, channelAddress: string) => {
		const authSub = await this.streamsService.authorizeSubscription(subscriptionLink, channelAddress);
		// Todo update subscription to be authorized
		await this.channelInfoService.updateLatestChannelLink(channelAddress, authSub.keyloadLink);
		return authSub;
	};
}
