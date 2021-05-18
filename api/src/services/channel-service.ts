import { StreamsService } from './streams-service';
import { AccessRights, Subscription, SubscriptionType } from '../models/types/subscription';
import { Topic } from '../models/types/channel-info';
import { ChannelInfoService } from './channel-info-service';
import { SubscriptionService } from './subscription-service';
import { fromBytes } from '../utils/text';
import { SubscriptionPool } from '../pools/subscription-pools';

export class ChannelService {
	private readonly password = 'test123';
	private readonly streamsService: StreamsService;
	private readonly channelInfoService: ChannelInfoService;
	private readonly subscriptionService: SubscriptionService;
	private readonly subscriptionPool: SubscriptionPool;

	constructor(streamsService: StreamsService, channelInfoService: ChannelInfoService, subscriptionService: SubscriptionService) {
		this.streamsService = streamsService;
		this.channelInfoService = channelInfoService;
		this.subscriptionService = subscriptionService;
		this.subscriptionPool = SubscriptionPool.getInstance();
	}

	create = async (userId: string, topics: Topic[], seed?: string): Promise<{ seed: string; channelAddress: string }> => {
		const res = await this.streamsService.create(seed);

		const subscription: Subscription = {
			userId,
			type: SubscriptionType.Author,
			channelAddress: res.channelAddress,
			seed: res.seed,
			subscriptionLink: res.channelAddress,
			state: this.streamsService.exportSubscription(res.author, this.password),
			accessRights: AccessRights.ReadAndWrite,
			isAuthorized: true
		};

		await this.subscriptionPool.add(res.author, userId, res.channelAddress, true);
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
		const sub = await this.subscriptionPool.get(channelAddress, userId, isAuth);
		if (!sub) {
			throw new Error(`no author/subscriber found with channelAddress: ${channelAddress} and userId: ${userId}`);
		}
		const logs = await this.streamsService.getLogs(sub);
		await this.subscriptionService.updateSubscriptionState(
			channelAddress,
			userId,
			this.streamsService.exportSubscription(logs.subscription, this.password)
		);
		return logs;
	};

	addLogs = async (channelAddress: string, publicPayload: string, maskedPayload: string, userId: string) => {
		const channelInfo = await this.channelInfoService.getChannelInfo(channelAddress);
		const isAuth = channelInfo.author === userId;
		// TODO encrypt/decrypt seed
		const latestLink = channelInfo.latestLink;
		const sub = await this.subscriptionPool.get(channelAddress, userId, isAuth);
		if (!sub) {
			throw new Error(`no author/subscriber found with channelAddress: ${channelAddress} and userId: ${userId}`);
		}
		const res = await this.streamsService.addLogs(latestLink, publicPayload, maskedPayload, sub);
		await this.subscriptionService.updateSubscriptionState(
			channelAddress,
			userId,
			this.streamsService.exportSubscription(res.subscription, this.password)
		);
		await this.channelInfoService.updateLatestChannelLink(channelAddress, res.link);
		return res;
	};
}
