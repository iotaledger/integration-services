import { StreamsService } from './streams-service';
import * as subscriptionDb from '../database/subscription';
import { AccessRights, Subscription, SubscriptionType } from '../models/types/subscription';
import { ChannelInfoService } from './channel-info-service';
import { SubscriptionPool } from '../pools/subscription-pools';
import { Author } from '../streams-lib/wasm-node/iota_streams_wasm';

export class SubscriptionService {
	private password: string;
	private readonly streamsService: StreamsService;
	private readonly channelInfoService: ChannelInfoService;
	private readonly subscriptionPool: SubscriptionPool;

	constructor(streamsService: StreamsService, channelInfoService: ChannelInfoService, config: { statePassword: string; streamsNode: string }) {
		this.streamsService = streamsService;
		this.channelInfoService = channelInfoService;
		this.subscriptionPool = SubscriptionPool.getInstance(config.streamsNode);
		this.password = config.statePassword;
	}

	getSubscription = async (channelAddress: string, userId: string) => {
		return subscriptionDb.getSubscription(channelAddress, userId);
	};

	addSubscription = async (subscription: Subscription) => {
		return subscriptionDb.addSubscription(subscription);
	};

	updateSubscriptionState = async (channelAddress: string, userId: string, state: string) => {
		return subscriptionDb.updateSubscriptionState(channelAddress, userId, state);
	};

	setSubscriptionAuthorized = async (channelAddress: string, subscriptionLink: string) => {
		const errMsg = 'could not authorize the subscription!';
		const isAuthorized = true;
		const res = await subscriptionDb.setSubscriptionAuthorization(channelAddress, subscriptionLink, isAuthorized);
		if (!res?.result?.n) {
			throw Error(errMsg);
		}
		return res;
	};

	requestSubscription = async (
		subscriberId: string,
		channelAddress: string,
		accessRights?: AccessRights,
		seed?: string
	): Promise<{ seed: string; subscriptionLink: string }> => {
		const res = await this.streamsService.requestSubscription(channelAddress, seed);
		const subscription: Subscription = {
			type: SubscriptionType.Subscriber,
			userId: subscriberId,
			channelAddress: channelAddress,
			seed: res.seed,
			subscriptionLink: res.subscriptionLink,
			accessRights: accessRights || AccessRights.ReadAndWrite,
			isAuthorized: false,
			state: this.streamsService.exportSubscription(res.subscriber, this.password)
		};

		await this.subscriptionPool.add(channelAddress, res.subscriber, subscriberId, false);
		await subscriptionDb.addSubscription(subscription);
		await this.channelInfoService.addChannelSubscriberId(channelAddress, subscriberId);
		await this.channelInfoService.updateLatestChannelLink(channelAddress, res.subscriptionLink);

		return res;
	};

	authorizeSubscription = async (channelAddress: string, subscriptionLink: string, authorId: string): Promise<{ keyloadLink: string }> => {
		const author = await this.subscriptionPool.get(channelAddress, authorId, true, this.password);
		if (!author) {
			throw new Error(`no author found with channelAddress: ${channelAddress} and userId: ${authorId}`);
		}
		const authSub = await this.streamsService.authorizeSubscription(channelAddress, subscriptionLink, <Author>author);
		if (!authSub?.keyloadLink) {
			throw new Error('could not authorize the subscription!');
		}
		await this.setSubscriptionAuthorized(channelAddress, subscriptionLink);
		await this.channelInfoService.updateLatestChannelLink(channelAddress, authSub.keyloadLink);

		return { keyloadLink: authSub.keyloadLink };
	};
}
