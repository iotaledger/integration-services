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

	getSubscription = async (channelAddress: string, userId: string) => {
		return subscriptionDb.getSubscription(channelAddress, userId);
	};

	addSubscription = async (subscription: Subscription) => {
		return subscriptionDb.addSubscription(subscription);
	};

	requestSubscription = async (
		subscriberId: string,
		channelAddress: string,
		accessRights?: AccessRights,
		seed?: string
	): Promise<{ seed: string; subscriptionLink: string }> => {
		// TODO check seed size == 81 if not null
		const res = await this.streamsService.requestSubscription(channelAddress, seed);
		const subscription: Subscription = {
			type: SubscriptionType.Subscriber,
			userId: subscriberId,
			channelAddress: channelAddress,
			seed: res.seed,
			subscriptionLink: res.subscriptionLink,
			accessRights: accessRights || AccessRights.ReadAndWrite,
			isAuthorized: false,
			state: ''
		};

		await subscriptionDb.addSubscription(subscription);
		await this.channelInfoService.addChannelSubscriber(channelAddress, subscriberId);
		await this.channelInfoService.updateLatestChannelLink(channelAddress, res.subscriptionLink);
		return res;
	};

	setSubscriptionAuthorized = async (channelAddress: string, subscriptionLink: string) => {
		const isAuthorized = true;
		return subscriptionDb.setSubscriptionAuthorization(channelAddress, subscriptionLink, isAuthorized);
	};

	authorizeSubscription = async (channelAddress: string, subscriptionLink: string) => {
		const authSub = await this.streamsService.authorizeSubscription(channelAddress, subscriptionLink);

		const res = await this.setSubscriptionAuthorized(channelAddress, subscriptionLink);
		console.log('res', res.result);

		const res2 = await this.channelInfoService.updateLatestChannelLink(channelAddress, authSub.keyloadLink);
		console.log('res', res2.result);
		return authSub;
	};
}
