import { StreamsService } from './streams-service';
import { AccessRights, Subscription, SubscriptionType } from '../models/types/subscription';
import { Topic } from '../models/types/channel-info';
import { ChannelInfoService } from './channel-info-service';
import { SubscriptionService } from './subscription-service';
import { SubscriptionPool } from '../pools/subscription-pools';
import * as ChannelDataDb from '../database/channel-data';
import { ChannelData, ChannelLog } from '../models/types/channel-data';
import { StreamsConfig } from '../models/config';
import { CreateChannelBodyResponse } from '../models/types/request-response-bodies';

export class ChannelService {
	private readonly password: string;

	constructor(
		private readonly streamsService: StreamsService,
		private readonly channelInfoService: ChannelInfoService,
		private readonly subscriptionService: SubscriptionService,
		private readonly subscriptionPool: SubscriptionPool,
		config: StreamsConfig
	) {
		this.password = config.statePassword;
	}

	create = async (identityId: string, topics: Topic[], encrypted: boolean, seed?: string): Promise<CreateChannelBodyResponse> => {
		const res = await this.streamsService.create(seed);
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
			keyloadLink: res.channelAddress
		};

		await this.subscriptionPool.add(res.channelAddress, res.author, identityId, true);
		await this.subscriptionService.addSubscription(subscription);
		await this.channelInfoService.addChannelInfo({
			topics,
			authorId: identityId,
			encrypted,
			channelAddress: res.channelAddress,
			latestLink: res.channelAddress
		});

		return res;
	};

	fetchLogsFromTangle = async (channelAddress: string, identityId: string): Promise<ChannelData[]> => {
		const subscription = await this.subscriptionService.getSubscription(channelAddress, identityId);
		if (!subscription) {
			throw new Error('no subscription found!');
		}

		const isAuth = subscription.type === SubscriptionType.Author;
		const sub = await this.subscriptionPool.get(channelAddress, identityId, isAuth);
		if (!sub) {
			throw new Error(`no author/subscriber found with channelAddress: ${channelAddress} and identityId: ${identityId}`);
		}
		const logs = await this.streamsService.getLogs(sub);
		if (!logs) {
			return [];
		}
		await this.subscriptionService.updateSubscriptionState(
			channelAddress,
			identityId,
			this.streamsService.exportSubscription(logs.subscription, this.password)
		);

		// store logs in database
		if (logs.channelData?.length > 0) {
			await ChannelDataDb.addChannelData(channelAddress, identityId, logs.channelData);
		}
		return logs.channelData;
	};

	getLogs = async (channelAddress: string, identityId: string, options?: { limit: number; index: number }) => {
		const subscription = await this.subscriptionService.getSubscription(channelAddress, identityId);
		if (!subscription || !subscription?.keyloadLink) {
			throw new Error('no subscription found!');
		}
		if (subscription.accessRights === AccessRights.Write) {
			throw new Error('not allowed to get logs from the channel');
		}

		await this.fetchLogsFromTangle(channelAddress, identityId);
		return await ChannelDataDb.getChannelData(channelAddress, identityId, options?.limit, options?.index);
	};

	addLogs = async (channelAddress: string, identityId: string, channelLog: ChannelLog): Promise<{ link: string }> => {
		const subscription = await this.subscriptionService.getSubscription(channelAddress, identityId);
		if (!subscription || !subscription?.keyloadLink) {
			throw new Error('no subscription found!');
		}

		const isAuthor = subscription.type === SubscriptionType.Author;
		// TODO encrypt/decrypt seed
		const sub = await this.subscriptionPool.get(channelAddress, identityId, isAuthor);
		if (!sub) {
			throw new Error(`no author/subscriber found with channelAddress: ${channelAddress} and identityId: ${identityId}`);
		}
		const { accessRights, keyloadLink } = subscription;

		if (subscription.accessRights === AccessRights.Read) {
			throw new Error('not allowed to add logs to the channel');
		} else if (accessRights === AccessRights.Write) {
			await sub.clone().sync_state();
		} else {
			// fetch prev logs before writing new data to the channel
			await this.fetchLogsFromTangle(channelAddress, identityId);
		}

		const res = await this.streamsService.addLogs(keyloadLink, sub, channelLog);

		// store newly added log
		const newLog: ChannelData = { link: res.link, channelLog };
		await ChannelDataDb.addChannelData(channelAddress, identityId, [newLog]);

		await this.subscriptionService.updateSubscriptionState(
			channelAddress,
			identityId,
			this.streamsService.exportSubscription(res.subscription, this.password)
		);
		await this.channelInfoService.updateLatestChannelLink(channelAddress, res.link);
		return { link: res.link };
	};
}
