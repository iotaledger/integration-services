import { StreamsService } from './streams-service';
import { AccessRights, Subscription, SubscriptionType } from '../models/types/subscription';
import { Topic } from '../models/types/channel-info';
import { ChannelInfoService } from './channel-info-service';
import { SubscriptionService } from './subscription-service';
import { fromBytes } from '../utils/text';

export class ChannelService {
	private readonly password = 'test123';
	private readonly streamsService: StreamsService;
	private readonly channelInfoService: ChannelInfoService;
	private readonly subscriptionService: SubscriptionService;

	constructor(streamsService: StreamsService, channelInfoService: ChannelInfoService, subscriptionService: SubscriptionService) {
		this.streamsService = streamsService;
		this.channelInfoService = channelInfoService;
		this.subscriptionService = subscriptionService;
	}

	create = async (userId: string, topics: Topic[], seed?: string): Promise<{ seed: string; channelAddress: string }> => {
		const res = await this.streamsService.create(seed);

		const subscription: Subscription = {
			userId,
			type: SubscriptionType.Author,
			channelAddress: res.channelAddress,
			seed: res.seed,
			subscriptionLink: res.channelAddress,
			state: fromBytes(res.subscription.clone().export(this.password)),
			accessRights: AccessRights.ReadAndWrite,
			isAuthorized: true
		};

		await this.subscriptionService.addSubscription(subscription);
		await this.channelInfoService.addChannelInfo({
			topics,
			author: userId,
			channelAddress: res.channelAddress,
			latestLink: res.channelAddress
		});

		return res;
	};

	getLogs = async (channelAddress: string, userId: string) => {
		const subscription = await this.subscriptionService.getSubscription(channelAddress, userId);
		const isAuth = subscription.type === SubscriptionType.Author;

		// TODO get subscription object by userId and check if it is the author or subscriber + pass state into method
		const logs = await this.streamsService.getLogs(isAuth);
		await this.subscriptionService.updateSubscriptionState(channelAddress, userId, fromBytes(logs.subscription.clone().export(this.password)));
		return logs;
	};

	addLogs = async (address: string, publicPayload: string, maskedPayload: string, userId: string) => {
		const channelInfo = await this.channelInfoService.getChannelInfo(address);
		const isAuth = channelInfo.author === userId;
		// TODO get state of subscription
		// TODO decrypt seed
		const latestLink = channelInfo.latestLink;
		const res = await this.streamsService.addLogs(latestLink, publicPayload, maskedPayload, isAuth);
		await this.subscriptionService.updateSubscriptionState(address, userId, fromBytes(res.subscription.clone().export(this.password)));
		await this.channelInfoService.updateLatestChannelLink(address, res.resLink);
		return res;
	};
}
