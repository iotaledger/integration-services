import { StreamsService } from './streams-service';
import * as ChannelDataDb from '../database/channel-data';
import * as subscriptionDb from '../database/subscription';
import { Subscription } from '../models/types/subscription';
import { AccessRights, SubscriptionType } from '../models/schemas/subscription';
import { ChannelInfoService } from './channel-info-service';
import { SubscriptionPool } from '../pools/subscription-pools';
import { Author } from '../streams-lib/wasm-node/iota_streams_wasm';
import { StreamsConfig } from '../models/config';
import { AuthorizeSubscriptionBodyResponse, RequestSubscriptionBodyResponse } from '../models/types/request-response-bodies';
import { isEmpty } from 'lodash';
import { ILock, Lock } from '../utils/lock';

export class SubscriptionService {
	private password: string;
	private lock: ILock;

	constructor(
		private readonly streamsService: StreamsService,
		private readonly channelInfoService: ChannelInfoService,
		private readonly subscriptionPool: SubscriptionPool,
		config: StreamsConfig
	) {
		this.lock = Lock.getInstance();
		this.password = config.statePassword;
	}

	async getSubscriptions(channelAddress: string, isAuthorized?: boolean) {
		return subscriptionDb.getSubscriptionsByAuthorization(channelAddress, isAuthorized);
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

	async setSubscriptionAuthorized(channelAddress: string, identityId: string, keyloadLink: string) {
		const errMsg = 'could not authorize the subscription!';
		const isAuthorized = true;
		const res = await subscriptionDb.setSubscriptionAuthorization(channelAddress, identityId, isAuthorized, keyloadLink);
		if (!res?.result?.n) {
			throw Error(errMsg);
		}
		return res;
	}

	async requestSubscription(params: {
		subscriberId: string;
		channelAddress: string;
		accessRights?: AccessRights;
		seed?: string;
		presharedKey?: string;
	}): Promise<RequestSubscriptionBodyResponse> {
		const { channelAddress, presharedKey, seed, subscriberId, accessRights } = params;
		const res = await this.streamsService.requestSubscription(channelAddress, seed, presharedKey);

		const subscription: Subscription = {
			type: SubscriptionType.Subscriber,
			identityId: subscriberId,
			channelAddress: channelAddress,
			seed: res.seed,
			subscriptionLink: res.subscriptionLink,
			accessRights: !isEmpty(presharedKey) ? AccessRights.Audit : accessRights, // always use audit for presharedKey
			isAuthorized: !isEmpty(presharedKey), // if there is a presharedKey the subscription is already authorized
			state: this.streamsService.exportSubscription(res.subscriber, this.password),
			publicKey: res.publicKey,
			presharedKey: presharedKey,
			keyloadLink: !isEmpty(presharedKey) ? channelAddress : undefined
		};

		await this.subscriptionPool.add(channelAddress, res.subscriber, subscriberId, false);
		await this.addSubscription(subscription);
		await this.channelInfoService.addChannelSubscriberId(channelAddress, subscriberId);

		return { seed: res.seed, subscriptionLink: res.subscriptionLink };
	}

	async authorizeSubscription(
		channelAddress: string,
		subscription: Subscription,
		authorSub: Subscription
	): Promise<AuthorizeSubscriptionBodyResponse> {
		const lockKey = channelAddress + authorSub.identityId;

		return this.lock.acquire(lockKey).then(async (release) => {
			try {
				const { publicKey, subscriptionLink, identityId } = subscription;
				const presharedKey = authorSub.presharedKey;
				const streamsAuthor = (await this.subscriptionPool.get(channelAddress, authorSub.identityId, true)) as Author;

				if (!streamsAuthor) {
					throw new Error(`no author found with channelAddress: ${channelAddress} and identityId: ${authorSub?.identityId}`);
				}

				const authorPubKey = streamsAuthor.clone().get_public_key();
				const subscriptions = await subscriptionDb.getSubscriptions(channelAddress);
				const existingSubscriptions = subscriptions.filter(
					(s) => s.isAuthorized === true && (s.accessRights === AccessRights.ReadAndWrite || s.accessRights === AccessRights.Read)
				);
				const existingSubscriptionKeys = existingSubscriptions.map((s) => s.publicKey).filter((pubkey) => pubkey);

				// fetch prev logs before syncing state
				await this.fetchLogs(channelAddress, streamsAuthor, authorSub.identityId);

				// authorize new subscription and add existing public keys to the new branch
				await this.streamsService.receiveSubscribe(subscriptionLink, streamsAuthor);
				const keyloadLink = await this.authSub({
					channelAddress,
					publicKeys: [publicKey, authorPubKey, ...existingSubscriptionKeys],
					streamsAuthor,
					authorId: authorSub.identityId,
					identityId,
					presharedKey
				});

				// create new branches for existing subscriptions including the newly added subscription public key
				await Promise.all(
					existingSubscriptions.map(async (sub) => {
						await this.authSub({
							channelAddress,
							publicKeys: [...existingSubscriptionKeys, authorPubKey, publicKey],
							streamsAuthor,
							authorId: authorSub.identityId,
							identityId: sub.identityId,
							presharedKey
						});
					})
				);

				await this.updateSubscriptionState(
					channelAddress,
					authorSub.identityId,
					this.streamsService.exportSubscription(streamsAuthor, this.password)
				);

				return { keyloadLink };
			} finally {
				release();
			}
		});
	}

	private async authSub(params: {
		channelAddress: string;
		publicKeys: string[];
		streamsAuthor: Author;
		authorId: string;
		identityId: string;
		presharedKey?: string;
	}): Promise<string> {
		const key = 'auth-sub-' + params.channelAddress + params.authorId;
		return await this.lock.acquire(key).then(async (release) => {
			try {
				const { presharedKey, channelAddress, publicKeys, streamsAuthor, identityId } = params;
				await streamsAuthor.clone().sync_state();
				const authSub = await this.streamsService.sendKeyload(channelAddress, publicKeys, <Author>streamsAuthor, presharedKey);
				if (!authSub?.keyloadLink) {
					throw new Error('no keyload link found when authorizing the subscription');
				}

				await this.setSubscriptionAuthorized(channelAddress, identityId, authSub.keyloadLink);
				return authSub.keyloadLink;
			} finally {
				release();
			}
		});
	}

	private async fetchLogs(channelAddress: string, author: Author, authorId: string): Promise<void> {
		const logs = await this.streamsService.getLogs(author);
		if (!logs?.channelData || logs?.channelData.length === 0) {
			return;
		}
		await this.updateSubscriptionState(channelAddress, authorId, this.streamsService.exportSubscription(author, this.password));
		await ChannelDataDb.addChannelData(channelAddress, authorId, logs.channelData);
	}
}
