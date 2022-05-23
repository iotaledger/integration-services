import { Author } from '@iota/streams/node/streams_wasm';
import { StreamsService } from './streams-service';
import * as ChannelDataDb from '../database/channel-data';
import * as SubscriptionDb from '../database/subscription';
import { Subscription, SubscriptionUpdate } from '@iota/is-shared-modules/lib/models/types/subscription';
import { AccessRights, SubscriptionType } from '@iota/is-shared-modules/lib/models/schemas/subscription';
import { ChannelInfoService } from './channel-info-service';
import { StreamsConfig } from '../models/config';
import { RequestSubscriptionResponse } from '@iota/is-shared-modules/lib/models/types/request-response-bodies';
import { isEmpty } from 'lodash';
import { ILock, Lock } from '../utils/lock';
import { ChannelData } from '@iota/is-shared-modules/lib/models/types/channel-data';
import { ChannelLogTransformer } from '../utils/channel-log-transformer';
import { ChannelType } from '@iota/is-shared-modules/lib/models/schemas/channel-info';

export class SubscriptionService {
	private password: string;
	private lock: ILock;

	constructor(
		private readonly streamsService: StreamsService,
		private readonly channelInfoService: ChannelInfoService,
		config: StreamsConfig
	) {
		this.lock = Lock.getInstance();
		this.password = config.statePassword;
	}

	async getSubscriptions(channelAddress: string, isAuthorized?: boolean) {
		return SubscriptionDb.getSubscriptionsByAuthorization(channelAddress, isAuthorized);
	}

	async getSubscription(channelAddress: string, id: string) {
		return SubscriptionDb.getSubscription(channelAddress, id);
	}

	async getSubscriptionByLink(subscriptionLink: string) {
		return SubscriptionDb.getSubscriptionByLink(subscriptionLink);
	}

	async getSubscriptionByPublicKey(channelAddress: string, publicKey: string) {
		return SubscriptionDb.getSubscriptionByPublicKey(channelAddress, publicKey);
	}

	async addSubscription(subscription: Subscription) {
		return SubscriptionDb.addSubscription(subscription);
	}

	async updateSubscription(channelAddress: string, id: string, subscription: SubscriptionUpdate) {
		return SubscriptionDb.updateSubscription(channelAddress, id, subscription);
	}

	async deleteSubscription(channelAddress: string, id: string) {
		return SubscriptionDb.removeSubscription(channelAddress, id);
	}

	async updateSubscriptionState(channelAddress: string, id: string, state: string) {
		return SubscriptionDb.updateSubscriptionState(channelAddress, id, state);
	}

	async isAuthor(channelAddress: string, authorId: string): Promise<boolean> {
		const channelInfo = await this.channelInfoService.getChannelInfo(channelAddress);
		return channelInfo.authorId == authorId;
	}

	async setSubscriptionAuthorized(channelAddress: string, id: string, keyloadLink: string, sequenceLink: string) {
		const errMsg = 'could not authorize the subscription!';
		const isAuthorized = true;
		const res = await SubscriptionDb.setSubscriptionAuthorization(channelAddress, id, isAuthorized, keyloadLink, sequenceLink);
		if (!res?.result?.n) {
			throw Error(errMsg);
		}
		return res;
	}

	async requestSubscription(params: {
		subscriberId: string;
		channelAddress: string;
		channelType: ChannelType;
		accessRights?: AccessRights;
		seed?: string;
		presharedKey?: string;
	}): Promise<RequestSubscriptionResponse> {
		const { channelAddress, presharedKey, seed, subscriberId, accessRights, channelType } = params;
		const isPublicChannel = channelType === ChannelType.public;
		const res = await this.streamsService.requestSubscription(channelAddress, isPublicChannel, seed, presharedKey);

		if (res.publicKey) {
			const existingSubscription = await this.getSubscriptionByPublicKey(channelAddress, res.publicKey);

			if (existingSubscription) {
				throw new Error('public key already used');
			}
		}

		const subscription: Subscription = {
			type: SubscriptionType.Subscriber,
			id: subscriberId,
			channelAddress: channelAddress,
			subscriptionLink: isPublicChannel ? channelAddress : res.subscriptionLink,
			accessRights: !isEmpty(presharedKey) || isPublicChannel ? AccessRights.Audit : accessRights, // always use audit for presharedKey and public channels
			isAuthorized: !isEmpty(presharedKey) || isPublicChannel, // if there is a presharedKey or it is a public channel the subscription is already authorized
			state: this.streamsService.exportSubscription(res.subscriber, this.password),
			publicKey: res.publicKey,
			pskId: res.pskId,
			keyloadLink: !isEmpty(presharedKey) || isPublicChannel ? channelAddress : undefined
		};

		await this.addSubscription(subscription);
		await this.channelInfoService.addChannelSubscriberId(channelAddress, subscriberId);

		return { seed: res.seed, subscriptionLink: res.subscriptionLink };
	}

	async authorizeSubscription(
		channelAddress: string,
		subscription: Subscription,
		authorId: string
	): Promise<{ keyloadLink: string; sequenceLink?: string }> {
		const authorSub = await this.getSubscription(channelAddress, authorId);
		const { publicKey, subscriptionLink, id } = subscription;
		const pskId = authorSub.pskId;
		const streamsAuthor = (await this.streamsService.importSubscription(authorSub.state, true)) as Author;

		if (!streamsAuthor) {
			throw new Error(`no author found with channelAddress: ${channelAddress} and id: ${authorSub?.id}`);
		}

		const authorPubKey = streamsAuthor.clone().get_public_key();
		const subscriptions = await SubscriptionDb.getSubscriptions(channelAddress);
		const existingSubscriptions: Subscription[] = subscriptions
			? subscriptions.filter(
					(s: Subscription) =>
						s?.isAuthorized === true && (s?.accessRights === AccessRights.ReadAndWrite || s?.accessRights === AccessRights.Read)
			  )
			: [];
		const existingSubscriptionKeys = existingSubscriptions.map((s: Subscription) => s?.publicKey).filter((pubkey: string) => pubkey);

		// fetch prev logs before syncing state
		await this.fetchLogs(channelAddress, streamsAuthor, authorSub.id);

		// authorize new subscription and add existing public keys to the new branch
		await this.streamsService.receiveSubscribe(subscriptionLink, streamsAuthor);
		const { keyloadLink, sequenceLink } = await this.sendKeyload({
			channelAddress,
			anchor: channelAddress,
			publicKeys: [publicKey, authorPubKey, ...existingSubscriptionKeys],
			streamsAuthor,
			authorId: authorSub.id,
			id,
			pskId
		});

		// create new keyloads for existing branches including the newly added subscription public key
		await Promise.all(
			existingSubscriptions.map(async (sub) => {
				await this.sendKeyload({
					channelAddress,
					anchor: sub?.sequenceLink || channelAddress,
					publicKeys: [...existingSubscriptionKeys, authorPubKey, publicKey],
					streamsAuthor,
					authorId: authorSub.id,
					id: sub.id,
					pskId
				});
			})
		);

		await this.updateSubscriptionState(channelAddress, authorSub.id, this.streamsService.exportSubscription(streamsAuthor, this.password));

		return { keyloadLink, sequenceLink };
	}

	async revokeSubscription(channelAddress: string, subscription: Subscription, authorSub: Subscription): Promise<void> {
		const { publicKey } = subscription;
		const pskId = authorSub.pskId;
		const streamsAuthor = (await this.streamsService.importSubscription(authorSub.state, true)) as Author;

		if (!streamsAuthor) {
			throw new Error(`no author found with channelAddress: ${channelAddress} and id: ${authorSub?.id}`);
		}

		const authorPubKey = streamsAuthor.clone().get_public_key();
		const subscriptions = await SubscriptionDb.getSubscriptions(channelAddress);
		const existingSubscriptions = subscriptions
			? subscriptions.filter(
					(s) => s?.isAuthorized === true && (s?.accessRights === AccessRights.ReadAndWrite || s?.accessRights === AccessRights.Read)
			  )
			: [];

		// remove revoked public key
		const filteredSubscriptionKeys = existingSubscriptions.map((s) => s?.publicKey).filter((pubkey) => pubkey && pubkey !== publicKey);

		// fetch prev logs before syncing state
		await this.fetchLogs(channelAddress, streamsAuthor, authorSub.id);

		// add new keyload message to existing branches but not including the revoked publicKey...
		await Promise.all(
			existingSubscriptions.map(async (sub) => {
				return await this.sendKeyload({
					channelAddress,
					anchor: sub?.sequenceLink || channelAddress,
					publicKeys: [...filteredSubscriptionKeys, authorPubKey],
					streamsAuthor,
					authorId: authorSub.id,
					id: sub.id,
					pskId
				});
			})
		);

		await SubscriptionDb.removeSubscription(channelAddress, subscription.id);
		await ChannelDataDb.removeChannelData(channelAddress, subscription.id);
		await this.channelInfoService.removeChannelSubscriberId(channelAddress, subscription.id);

		await this.updateSubscriptionState(channelAddress, authorSub.id, this.streamsService.exportSubscription(streamsAuthor, this.password));
	}

	private async sendKeyload(params: {
		channelAddress: string;
		anchor: string;
		publicKeys: string[];
		streamsAuthor: Author;
		authorId: string;
		id: string;
		pskId?: string;
	}): Promise<{ keyloadLink: string; sequenceLink?: string }> {
		const key = 'auth-sub-' + params.channelAddress + params.authorId;
		return await this.lock.acquire(key).then(async (release) => {
			try {
				const { pskId, channelAddress, publicKeys, streamsAuthor, id, anchor } = params;
				await streamsAuthor.clone().sync_state();
				const authSub = await this.streamsService.sendKeyload(anchor, publicKeys, <Author>streamsAuthor, pskId);

				if (!authSub?.keyloadLink) {
					throw new Error('no keyload link found when authorizing the subscription');
				}

				await this.setSubscriptionAuthorized(channelAddress, id, authSub.keyloadLink, authSub.sequenceLink);
				return authSub;
			} finally {
				release();
			}
		});
	}

	private async fetchLogs(channelAddress: string, author: Author, authorId: string): Promise<void> {
		const streamsMessages = await this.streamsService.getMessages(author);
		if (!streamsMessages || streamsMessages?.length === 0) {
			return;
		}

		await this.updateSubscriptionState(channelAddress, authorId, this.streamsService.exportSubscription(author, this.password));
		const channelData: ChannelData[] = ChannelLogTransformer.transformStreamsMessages(streamsMessages);
		await ChannelDataDb.addChannelData(channelAddress, authorId, channelData, this.password);
	}
}
