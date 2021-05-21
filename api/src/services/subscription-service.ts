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
		const isAuthorized = true;
		return subscriptionDb.setSubscriptionAuthorization(channelAddress, subscriptionLink, isAuthorized);
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
			state: this.streamsService.exportSubscription(res.subscriber, this.password)
		};

		await this.subscriptionPool.add(res.subscriber, subscriberId, channelAddress, false);
		await subscriptionDb.addSubscription(subscription);
		await this.channelInfoService.addChannelSubscriberId(channelAddress, subscriberId);
		await this.channelInfoService.updateLatestChannelLink(channelAddress, res.subscriptionLink);

		return res;
	};

	authorizeSubscription = async (channelAddress: string, subscriptionLink: string, authorId: string) => {
		const errMsg = 'could not authorize the subscription!';
		const author = await this.subscriptionPool.get(channelAddress, authorId, true, this.password);
		if (!author) {
			throw new Error(`no author found with channelAddress: ${channelAddress} and userId: ${authorId}`);
		}
		const authSub = await this.streamsService.authorizeSubscription(channelAddress, subscriptionLink, <Author>author);

		const res = await this.setSubscriptionAuthorized(channelAddress, subscriptionLink);
		if (!res?.result?.n) {
			throw Error(errMsg);
		}

		const res2 = await this.channelInfoService.updateLatestChannelLink(channelAddress, authSub.keyloadLink);
		if (!res2?.result?.n) {
			throw Error(errMsg);
		}
		return authSub;
	};
}
