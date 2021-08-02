import { StreamsService } from './streams-service';
import * as subscriptionDb from '../database/subscription';
import { Subscription } from '../models/types/subscription';
import { AccessRights, SubscriptionType } from '../models/schemas/subscription';
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

	async getSubscriptions(channelAddress: string, isAuthorized: boolean) {
		return subscriptionDb.getSubscriptionsByAuthorization(channelAddress, isAuthorized);
	}

	async getSubscriptionByIdentity(channelAddress: string, identityId: string) {
		return subscriptionDb.getSubscriptionByIdentity(channelAddress, identityId);
	}

	async getSubscription(channelAddress: string, identityId: string) {
		return subscriptionDb.getSubscription(channelAddress, identityId);
	}

	async getSubscriptionByLink(subscriptionLink: string) {
		return subscriptionDb.getSubscriptionByLink(subscriptionLink);
	}

	async addSubscription(subscription: Subscription) {
		return subscriptionDb.addSubscription(subscription);
	}

	async updateSubscriptionState(channelAddress: string, identityId: string, state: string) {
		return subscriptionDb.updateSubscriptionState(channelAddress, identityId, state);
	}

	async setSubscriptionAuthorized(channelAddress: string, subscriptionLink: string, keyloadLink: string) {
		const errMsg = 'could not authorize the subscription!';
		const isAuthorized = true;
		const res = await subscriptionDb.setSubscriptionAuthorization(channelAddress, subscriptionLink, isAuthorized, keyloadLink);
		if (!res?.result?.n) {
			throw Error(errMsg);
		}
		return res;
	}

	async requestSubscription(
		subscriberId: string,
		channelAddress: string,
		accessRights?: AccessRights,
		seed?: string
	): Promise<RequestSubscriptionBodyResponse> {
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
	}

	async authorizeSubscription(
		channelAddress: string,
		subscriptionLink: string,
		publicKey: string,
		authorId: string
	): Promise<AuthorizeSubscriptionBodyResponse> {
		const author = (await this.subscriptionPool.get(channelAddress, authorId, true)) as Author;
		if (!author) {
			throw new Error(`no author found with channelAddress: ${channelAddress} and identityId: ${authorId}`);
		}
		const subscriptions = await subscriptionDb.getSubscriptions(channelAddress);
		const existingSubscriptions = subscriptions.filter((s) => s.type === SubscriptionType.Subscriber && s.isAuthorized === true);
		const existingSubscriptionKeys = existingSubscriptions.map((s) => s.publicKey);

		// TODO fetch prev logs

		// authorize new subscription and add existing public keys to the branch
		await this.streamsService.receiveSubscribe(subscriptionLink, <Author>author);
		const keyloadLink = await this.authSub(channelAddress, [publicKey, ...existingSubscriptionKeys], author, authorId, subscriptionLink);

		// create new branches including the newly added subscription public key
		await Promise.all(
			existingSubscriptions.map(async (sub) => {
				return await this.authSub(channelAddress, [...existingSubscriptionKeys, publicKey], author, authorId, sub.subscriptionLink);
			})
		);

		return { keyloadLink };
	}

	private async authSub(channelAddress: string, publicKeys: string[], author: Author, authorId: string, subscriptionLink: string): Promise<string> {
		await author.sync_state();
		const authSub = await this.streamsService.authorizeSubscription(channelAddress, publicKeys, <Author>author);
		if (!authSub?.keyloadLink) {
			throw new Error('no keyload link found when authorizing the subscription');
		}

		await this.setSubscriptionAuthorized(channelAddress, subscriptionLink, authSub.keyloadLink);
		await this.channelInfoService.updateLatestChannelLink(channelAddress, authSub.keyloadLink);
		await this.updateSubscriptionState(channelAddress, authorId, this.streamsService.exportSubscription(authSub.author, this.password));
		return authSub.keyloadLink;
	}
}
