import { StreamsService } from './streams-service';
import { Subscription } from '../models/types/subscription';
import { AccessRights, SubscriptionType } from '../models/schemas/subscription';
import { Topic } from '../models/types/channel-info';
import { ChannelInfoService } from './channel-info-service';
import { SubscriptionService } from './subscription-service';
import { SubscriptionPool } from '../pools/subscription-pools';
import * as ChannelDataDb from '../database/channel-data';
import { ChannelData, ChannelLog } from '../models/types/channel-data';
import { StreamsConfig } from '../models/config';
import { CreateChannelBodyResponse } from '../models/types/request-response-bodies';
import { randomBytes } from 'crypto';
import { ILock, Lock } from '../utils/lock';
import { Subscriber, Author } from '../streams-lib/wasm-node/iota_streams_wasm';
import { getDateStringFromDate } from '../utils/date';
import { ChannelLogTransformer } from '../utils/channel-log-transformer';

export class ChannelService {
	private readonly password: string;
	private lock: ILock;

	constructor(
		private readonly streamsService: StreamsService,
		private readonly channelInfoService: ChannelInfoService,
		private readonly subscriptionService: SubscriptionService,
		private readonly subscriptionPool: SubscriptionPool,
		config: StreamsConfig
	) {
		this.lock = Lock.getInstance();
		this.password = config.statePassword;
	}

	async create(params: {
		identityId: string;
		topics: Topic[];
		hasPresharedKey: boolean;
		seed?: string;
		presharedKey?: string;
		subscriptionPassword?: string;
	}): Promise<CreateChannelBodyResponse> {
		const { presharedKey, seed, hasPresharedKey, identityId, topics } = params;
		let key = presharedKey;
		if (hasPresharedKey && !key) {
			key = randomBytes(16).toString('hex');
		}

		const res = await this.streamsService.create(seed, key);

		if (!res?.seed || !res?.channelAddress || !res?.author) {
			throw new Error('could not create the channel');
		}

		const subscription: Subscription = {
			identityId,
			type: SubscriptionType.Author,
			channelAddress: res.channelAddress,
			seed: res.seed,
			subscriptionLink: res.channelAddress,
			state: this.streamsService.exportSubscription(res.author, this.password),
			accessRights: AccessRights.ReadAndWrite,
			isAuthorized: true,
			publicKey: null,
			keyloadLink: res.keyloadLink,
			presharedKey: res.presharedKey
		};

		await this.subscriptionPool.add(res.channelAddress, res.author, identityId, true);
		await this.subscriptionService.addSubscription(subscription);
		await this.channelInfoService.addChannelInfo({
			topics,
			authorId: identityId,
			channelAddress: res.channelAddress
		});

		return {
			channelAddress: res.channelAddress,
			presharedKey: res.presharedKey,
			seed: res.seed
		};
	}

	async fetchLogs(channelAddress: string, identityId: string, sub: Author | Subscriber): Promise<ChannelData[]> {
		if (!sub) {
			throw new Error(`no author/subscriber found with channelAddress: ${channelAddress} and identityId: ${identityId}`);
		}
		const messages = await this.streamsService.getMessages(sub);
		console.log('MESSAAGES', messages);

		if (!messages) {
			return [];
		}
		await this.subscriptionService.updateSubscriptionState(channelAddress, identityId, this.streamsService.exportSubscription(sub, this.password));

		const channelData: ChannelData[] = ChannelLogTransformer.transformStreamsMessages(messages);
		// store logs in database
		if (channelData?.length > 0) {
			await ChannelDataDb.addChannelData(channelAddress, identityId, channelData);
		}

		return channelData;
	}

	async getHistory(channelAddress: string, presharedKey: string): Promise<ChannelData[]> {
		const seed: string = undefined;
		const { subscriber } = await this.streamsService.requestSubscription(channelAddress, seed, presharedKey);
		const messages = await this.streamsService.getMessages(subscriber);
		return ChannelLogTransformer.transformStreamsMessages(messages);
	}

	async getLogs(channelAddress: string, identityId: string, options: { limit?: number; index?: number; ascending: boolean }) {
		const lockKey = channelAddress + identityId;

		return this.lock.acquire(lockKey).then(async (release) => {
			try {
				const subscription = await this.subscriptionService.getSubscription(channelAddress, identityId);
				if (!subscription || !subscription?.keyloadLink) {
					throw new Error('no subscription found!');
				}
				if (subscription.accessRights === AccessRights.Write) {
					throw new Error('not allowed to get logs from the channel');
				}

				const isAuthor = subscription.type === SubscriptionType.Author;
				const sub = await this.subscriptionPool.get(channelAddress, identityId, isAuthor);

				await this.fetchLogs(channelAddress, identityId, sub);
				return await ChannelDataDb.getChannelData(channelAddress, identityId, options);
			} finally {
				release();
			}
		});
	}

	async addLogs(channelAddress: string, identityId: string, log: ChannelLog): Promise<ChannelData> {
		const lockKey = channelAddress + identityId;

		return this.lock.acquire(lockKey).then(async (release) => {
			try {
				const channelLog: ChannelLog = { created: getDateStringFromDate(new Date()), ...log };
				const subscription = await this.subscriptionService.getSubscription(channelAddress, identityId);

				if (!subscription || !subscription?.keyloadLink) {
					throw new Error('no subscription found!');
				}

				const isAuthor = subscription.type === SubscriptionType.Author;
				const sub = await this.subscriptionPool.get(channelAddress, identityId, isAuthor);

				if (!sub) {
					throw new Error(`no author/subscriber found with channelAddress: ${channelAddress} and identityId: ${identityId}`);
				}
				const { accessRights, keyloadLink } = subscription;

				// check access rights
				if (subscription.accessRights === AccessRights.Read || subscription.accessRights === AccessRights.Audit) {
					throw new Error('not allowed to add logs to the channel');
				} else if (accessRights === AccessRights.Write) {
					if (sub) {
						await sub.clone().sync_state();
					}
				} else {
					// fetch prev logs before writing new data to the channel
					await this.fetchLogs(channelAddress, identityId, sub);
				}

				const { maskedPayload, publicPayload } = ChannelLogTransformer.getPayloads(channelLog);
				const res = await this.streamsService.publishMessage(keyloadLink, sub, publicPayload, maskedPayload);

				// store newly added log
				const newLog: ChannelData = { link: res.link, messageId: res.messageId, channelLog };
				await ChannelDataDb.addChannelData(channelAddress, identityId, [newLog]);

				await this.subscriptionService.updateSubscriptionState(
					channelAddress,
					identityId,
					this.streamsService.exportSubscription(sub, this.password)
				);
				return newLog;
			} finally {
				release();
			}
		});
	}

	async reimport(channelAddress: string, identityId: string, seed: string, _subscriptionPassword?: string): Promise<void> {
		const lockKey = channelAddress + identityId;

		return this.lock.acquire(lockKey).then(async (release) => {
			try {
				const subscription = await this.subscriptionService.getSubscription(channelAddress, identityId);

				if (!subscription || !subscription?.keyloadLink || !subscription.publicKey) {
					throw new Error('no subscription found!');
				}

				if (subscription.accessRights === AccessRights.Write) {
					throw new Error('not allowed to reimport the logs from the channel');
				}

				const isAuthor = subscription.type === SubscriptionType.Author;
				const newSub = await this.streamsService.resetState(channelAddress, seed, isAuthor);
				const newPublicKey = newSub.clone().get_public_key();

				if (newPublicKey !== subscription.publicKey) {
					throw new Error('wrong seed inserted');
				}

				await ChannelDataDb.deleteChannelData(channelAddress, identityId);
				await this.fetchLogs(channelAddress, identityId, newSub);
			} finally {
				release();
			}
		});
	}
}
