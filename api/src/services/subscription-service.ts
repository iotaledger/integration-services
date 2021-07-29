import { StreamsService } from './streams-service';
import * as subscriptionDb from '../database/subscription';
import { AccessRights, Subscription, SubscriptionType } from '../models/types/subscription';
import { ChannelInfoService } from './channel-info-service';
import { SubscriptionPool } from '../pools/subscription-pools';
import { Author } from '../streams-lib/wasm-node/iota_streams_wasm';
import { StreamsConfig } from '../models/config';
import { AuthorizeSubscriptionBodyResponse, RequestSubscriptionBodyResponse } from '../models/types/request-response-bodies';

export class SubscriptionService {
	private password: string;

	constructor(
		private readonly streamsService: StreamsService,
		private readonly channelInfoService: ChannelInfoService,
		private readonly subscriptionPool: SubscriptionPool,
		config: StreamsConfig
	) {
		this.password = config.statePassword;
	}

	getSubscription = async (channelAddress: string, identityId: string) => {
		return subscriptionDb.getSubscription(channelAddress, identityId);
	};

	getSubscriptionByLink = async (subscriptionLink: string) => {
		return subscriptionDb.getSubscriptionByLink(subscriptionLink);
	};

	addSubscription = async (subscription: Subscription) => {
		return subscriptionDb.addSubscription(subscription);
	};

	updateSubscriptionState = async (channelAddress: string, identityId: string, state: string) => {
		return subscriptionDb.updateSubscriptionState(channelAddress, identityId, state);
	};

	setSubscriptionAuthorized = async (channelAddress: string, subscriptionLink: string, keyloadLink: string) => {
		const errMsg = 'could not authorize the subscription!';
		const isAuthorized = true;
		const res = await subscriptionDb.setSubscriptionAuthorization(channelAddress, subscriptionLink, isAuthorized, keyloadLink);
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
	): Promise<RequestSubscriptionBodyResponse> => {
		const res = await this.streamsService.requestSubscription(channelAddress, seed);
		const subscription: Subscription = {
			type: SubscriptionType.Subscriber,
			identityId: subscriberId,
			channelAddress: channelAddress,
			seed: res.seed,
			subscriptionLink: res.subscriptionLink,
			accessRights: accessRights || AccessRights.ReadAndWrite,
			isAuthorized: false,
			state: this.streamsService.exportSubscription(res.subscriber, this.password),
			publicKey: res.publicKey
		};

		await this.subscriptionPool.add(channelAddress, res.subscriber, subscriberId, false);
		await this.addSubscription(subscription);
		await this.channelInfoService.addChannelSubscriberId(channelAddress, subscriberId);
		await this.channelInfoService.updateLatestChannelLink(channelAddress, res.subscriptionLink);

		return { seed: res.seed, subscriptionLink: res.subscriptionLink };
	};

	authorizeSubscription = async (
		channelAddress: string,
		subscriptionLink: string,
		publicKey: string,
		authorId: string
	): Promise<AuthorizeSubscriptionBodyResponse> => {
		const author = await this.subscriptionPool.get(channelAddress, authorId, true);
		if (!author) {
			throw new Error(`no author found with channelAddress: ${channelAddress} and identityId: ${authorId}`);
		}
		const subscriptions = await subscriptionDb.getSubscriptions(channelAddress);
		const subs = subscriptions.filter((s) => s.type === SubscriptionType.Subscriber && s.isAuthorized === true);
		const existingSubscriptionKeys = subs.map((s) => s.publicKey);

		// authorize new subscription
		await this.streamsService.receiveSubscribe(subscriptionLink, <Author>author);
		const authSub = await this.streamsService.authorizeSubscription(channelAddress, [publicKey, ...existingSubscriptionKeys], <Author>author);
		if (!authSub?.keyloadLink) {
			throw new Error('no keyload link found when authorizing the subscription');
		}
		await this.setSubscriptionAuthorized(channelAddress, subscriptionLink, authSub.keyloadLink);
		await this.channelInfoService.updateLatestChannelLink(channelAddress, authSub.keyloadLink);
		await this.updateSubscriptionState(channelAddress, authorId, this.streamsService.exportSubscription(author, this.password));

		// TODO authorize new subscription to existing branches

		return { keyloadLink: authSub.keyloadLink };
	};
}
