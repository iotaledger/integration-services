import { StreamsService } from './streams-service';
import * as subscriptionDb from '../database/subscription';
import { AccessRights, Subscription, SubscriptionType } from '../models/types/subscription';
import { ChannelInfoService } from './channel-info-service';
import { SubscriptionPool } from '../pools/subscription-pools';
import { Author } from '../streams-lib/wasm-node/iota_streams_wasm';
import { StreamsConfig } from '../models/config';

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

	requestSubscription = async (subscriberId: string, channelAddress: string, accessRights?: AccessRights, seed?: string) => {
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
		await subscriptionDb.addSubscription(subscription);
		await this.channelInfoService.addChannelSubscriberId(channelAddress, subscriberId);
		await this.channelInfoService.updateLatestChannelLink(channelAddress, res.subscriptionLink);

		return res;
	};

	authorizeSubscription = async (
		channelAddress: string,
		subscriptionLink: string,
		publicKey: string,
		authorId: string
	): Promise<{ keyloadLink: string }> => {
		const author = await this.subscriptionPool.get(channelAddress, authorId, true);
		if (!author) {
			throw new Error(`no author found with channelAddress: ${channelAddress} and identityId: ${authorId}`);
		}
		const authSub = await this.streamsService.authorizeSubscription(channelAddress, subscriptionLink, publicKey, <Author>author);
		if (!authSub?.keyloadLink) {
			throw new Error('could not authorize the subscription!');
		}
		await this.setSubscriptionAuthorized(channelAddress, subscriptionLink, authSub.keyloadLink);
		await this.channelInfoService.updateLatestChannelLink(channelAddress, authSub.keyloadLink);

		return { keyloadLink: authSub.keyloadLink };
	};
}
