import { Author, Subscriber } from '@iota/streams/node/streams_wasm';
import { StreamsService } from './streams-service';
import {
	Subscription,
	AccessRights,
	SubscriptionType,
	ChannelLogRequestOptions,
	Topic,
	ChannelType,
	ChannelData,
	ChannelLog,
	CreateChannelResponse,
	ValidateResponse
} from '@iota/is-shared-modules';
import { getDateStringFromDate, ILogger, createAsymSharedKey } from '@iota/is-shared-modules/node';
import { ChannelInfoService } from './channel-info-service';
import { SubscriptionService } from './subscription-service';
import * as ChannelDataDb from '../database/channel-data';
import { StreamsConfig } from '../models/config';
import { randomBytes } from 'crypto';
import { ILock, Lock } from '../utils/lock';
import { ChannelLogTransformer } from '../utils/channel-log-transformer';
import { searchChannelInfo } from '../database/channel-info';
import { isEmpty } from 'lodash';
import * as bs58 from 'bs58';
import * as Identity from '@iota/identity-wasm/node';

export class ChannelService {
	private readonly statePassword: string;
	private lock: ILock;

	constructor(
		private readonly streamsService: StreamsService,
		private readonly channelInfoService: ChannelInfoService,
		private readonly subscriptionService: SubscriptionService,
		config: StreamsConfig,
		private readonly logger: ILogger
	) {
		this.lock = Lock.getInstance();
		this.statePassword = config.statePassword;
	}

	async create(params: {
		id: string;
		name: string;
		description?: string;
		topics: Topic[];
		hasPresharedKey: boolean;
		seed?: string;
		presharedKey?: string;
		type?: ChannelType;
		hidden?: boolean;
		asymPubKey?: string;
		visibilityList: { id: string }[];
	}): Promise<CreateChannelResponse> {
		const { name, description, presharedKey, seed, hasPresharedKey, id, topics, type, hidden, visibilityList, asymPubKey } = params;
		let peerPublicKey: string = undefined;
		let statePassword = this.statePassword;
		let key = presharedKey;
		if (hasPresharedKey && !key) {
			key = randomBytes(16).toString('hex');
		}

		const res = await this.streamsService.create(type === ChannelType.public, seed, key);

		if (!res?.seed || !res?.channelAddress || !res?.author) {
			throw new Error('could not create the channel');
		}

		if (type === ChannelType.privatePlus) {
			// TODO replace this with a new endpoint at the ssi-bridge
			const keypair = new Identity.KeyPair(Identity.KeyType.X25519);
			peerPublicKey = bs58.encode(keypair.public());
			const tmpPrivateEncryptionKey = bs58.encode(keypair.private());
			statePassword = createAsymSharedKey(tmpPrivateEncryptionKey, asymPubKey).slice(0, 32);
		}

		const state = this.streamsService.exportSubscription(res.author, statePassword);
		await this.subscriptionService.addSubscriptionState(res.channelAddress, id, state);

		const subscription: Subscription = {
			id,
			type: SubscriptionType.Author,
			channelAddress: res.channelAddress,
			subscriptionLink: res.channelAddress,
			accessRights: AccessRights.ReadAndWrite,
			isAuthorized: true,
			publicKey: res.publicKey,
			keyloadLink: res.keyloadLink,
			pskId: res.pskId,
			sequenceLink: res.sequenceLink
		};

		await this.subscriptionService.addSubscription(subscription);
		await this.channelInfoService.addChannelInfo({
			topics,
			authorId: id,
			name,
			description,
			channelAddress: res.channelAddress,
			type,
			hidden,
			visibilityList,
			peerPublicKey
		});

		return {
			channelAddress: res.channelAddress,
			presharedKey: res.presharedKey,
			seed: res.seed
		};
	}

	async channelExists(name: string): Promise<boolean> {
		if (!name) {
			return false;
		}
		const channel = await searchChannelInfo({ name });
		return !isEmpty(channel);
	}

	async fetchLogs(channelAddress: string, id: string, sub: Author | Subscriber, statePassword: string): Promise<ChannelData[]> {
		if (!sub) {
			throw new Error(`no author/subscriber found with channelAddress: ${channelAddress} and id: ${id}`);
		}
		const messages = await this.streamsService.getMessages(sub);

		if (!messages) {
			return [];
		}
		await this.subscriptionService.updateSubscriptionState(channelAddress, id, this.streamsService.exportSubscription(sub, statePassword));

		const channelData: ChannelData[] = ChannelLogTransformer.transformStreamsMessages(messages);
		// store logs in database
		if (channelData?.length > 0) {
			await ChannelDataDb.addChannelData(channelAddress, id, channelData, statePassword);
		}

		return channelData;
	}

	async getHistory(channelAddress: string, type: ChannelType, presharedKey: string): Promise<ChannelData[]> {
		const seed: string = undefined;
		const { subscriber } = await this.streamsService.requestSubscription(channelAddress, type === ChannelType.public, seed, presharedKey);
		const messages = await this.streamsService.getMessages(subscriber);
		return ChannelLogTransformer.transformStreamsMessages(messages);
	}

	async getLogs(channelAddress: string, id: string, options: ChannelLogRequestOptions, asymSharedKey?: string) {
		const lockKey = channelAddress + id;

		return this.lock.acquire(lockKey).then(async (release) => {
			try {
				const statePassword = this.getPassword(asymSharedKey);
				const subscription = await this.subscriptionService.getSubscription(channelAddress, id);
				if (!subscription || !subscription?.keyloadLink) {
					throw new Error('no subscription found!');
				}
				if (subscription.accessRights === AccessRights.Write) {
					throw new Error('not allowed to get logs from the channel');
				}

				// normally it should be possible to use `getChannelData` and fetch the data but the subscription was not able to receive the data from a public channel
				// that's why we use the getHistory workaround here and need to investigate after the new streams version is released
				const type = await this.channelInfoService.getChannelType(channelAddress);
				if (type === ChannelType.public) {
					return this.getHistory(channelAddress, ChannelType.public, '');
				}

				// for all other channels we simply use the subscription and cache the data in the database
				const state = await this.subscriptionService.getSubscriptionState(channelAddress, id);
				const isAuthor = subscription.type === SubscriptionType.Author;
				const sub = await this.streamsService.importSubscription(state, isAuthor, statePassword);

				await this.fetchLogs(channelAddress, id, sub, statePassword);
				return await ChannelDataDb.getChannelData(channelAddress, id, options, statePassword);
			} finally {
				release();
			}
		});
	}

	async addLog(channelAddress: string, id: string, channelLog: ChannelLog): Promise<ChannelData> {
		const lockKey = channelAddress + id;

		return this.lock.acquire(lockKey).then(async (release) => {
			try {
				const { asymSharedKey } = channelLog;
				const statePassword = this.getPassword(asymSharedKey);
				const log: ChannelLog = { created: getDateStringFromDate(new Date()), ...channelLog };
				const subscription = await this.subscriptionService.getSubscription(channelAddress, id);

				if (!subscription || !subscription?.keyloadLink) {
					throw new Error('no subscription found!');
				}

				const state = await this.subscriptionService.getSubscriptionState(channelAddress, id);
				const isAuthor = subscription.type === SubscriptionType.Author;
				const sub = await this.streamsService.importSubscription(state, isAuthor, statePassword);

				if (!sub) {
					throw new Error(`no author/subscriber found with channelAddress: ${channelAddress} and id: ${id}`);
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
					await this.fetchLogs(channelAddress, id, sub, statePassword);
				}

				const { maskedPayload, publicPayload } = ChannelLogTransformer.getPayloads(log);
				const res = await this.streamsService.publishMessage(keyloadLink, sub, publicPayload, maskedPayload);

				// store newly added log
				const newLog: ChannelData = { link: res.link, messageId: res.messageId, log, source: { publicKey: res.source, id } };
				await ChannelDataDb.addChannelData(channelAddress, id, [newLog], statePassword);

				await this.subscriptionService.updateSubscriptionState(
					channelAddress,
					id,
					this.streamsService.exportSubscription(sub, statePassword)
				);
				return newLog;
			} finally {
				release();
			}
		});
	}

	async reimport(channelAddress: string, id: string, _seed: string, _subscriptionPassword?: string): Promise<void> {
		const lockKey = channelAddress + id;

		return this.lock.acquire(lockKey).then(async (release) => {
			try {
				const subscription = await this.subscriptionService.getSubscription(channelAddress, id);

				if (!subscription || !subscription?.keyloadLink || !subscription.publicKey) {
					throw new Error('no subscription found!');
				}

				if (subscription.accessRights === AccessRights.Write) {
					throw new Error('not allowed to reimport the logs from the channel');
				}

				const isAuthor = subscription.type === SubscriptionType.Author;
				const state = await this.subscriptionService.getSubscriptionState(channelAddress, id);
				const sub = await this.streamsService.importSubscription(state, isAuthor, this.statePassword); // TODO

				const newSub = await this.streamsService.resetState(channelAddress, sub, isAuthor);
				const newPublicKey = newSub.clone().get_public_key();

				if (newPublicKey !== subscription.publicKey) {
					throw new Error('wrong seed inserted');
				}

				await ChannelDataDb.removeChannelData(channelAddress, id);
				await this.fetchLogs(channelAddress, id, newSub, this.statePassword); // TODO
			} finally {
				release();
			}
		});
	}

	async validate(channelAddress: string, id: string, logs: ChannelData[]): Promise<ValidateResponse> {
		const lockKey = channelAddress + id;

		return this.lock.acquire(lockKey).then(async (release) => {
			try {
				const subscription = await this.subscriptionService.getSubscription(channelAddress, id);

				// TODO check when no publicKey is needed....
				if (!subscription || !subscription?.keyloadLink) {
					throw new Error('no subscription found!');
				}

				if (subscription.accessRights === AccessRights.Write) {
					throw new Error('not allowed to validate the logs from the channel');
				}

				const state = await this.subscriptionService.getSubscriptionState(channelAddress, id);
				const isAuthor = subscription.type === SubscriptionType.Author;
				const sub = await this.streamsService.importSubscription(state, isAuthor, this.statePassword); // TODO

				if (!sub) {
					throw new Error(`no author/subscriber found with channelAddress: ${channelAddress} and id: ${id}`);
				}
				await sub.clone().sync_state();

				const streamsMessages = await Promise.all(
					logs.map(async (log) => {
						const key = 'get-message-' + channelAddress + id;
						return await this.lock.acquire(key).then(async (release) => {
							try {
								return await this.streamsService.getMessage(sub.clone(), log?.link);
							} catch (e) {
								this.logger.error(`could not validate message with link: ${log?.link}`);
								this.logger.error(e);
							} finally {
								release();
							}
						});
					})
				);
				const tangleLogs = ChannelLogTransformer.transformStreamsMessages(streamsMessages);
				return ChannelLogTransformer.validateLogs(logs, tangleLogs);
			} finally {
				release();
			}
		});
	}
	private getPassword(sharedKey: string) {
		if (sharedKey) {
			return sharedKey.slice(0, 32);
		}
		return this.statePassword;
	}
}
