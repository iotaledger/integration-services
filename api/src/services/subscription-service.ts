import { StreamsService } from './streams-service';
import * as subscriptionDb from '../database/subscription';
import { AccessRights, Subscription, SubscriptionType } from '../models/types/subscription';

export class SubscriptionService {
	streamsService: StreamsService;

	constructor(streamsService: StreamsService) {
		this.streamsService = streamsService;
	}

	getSubscriptions = async (announcementLink: string): Promise<void> => {
		return this.streamsService.getSubscriptions(announcementLink);
	};

	requestSubscription = async (
		userId: string,
		announcementLink: string,
		seed?: string,
		accessRights?: AccessRights
	): Promise<{ seed: string; subLink: string }> => {
		// TODO check seed size == 81 if not null
		const subReq = await this.streamsService.requestSubscription(announcementLink, seed);
		const subscription: Subscription = {
			userId,
			channelAddress: announcementLink,
			seed: subReq.seed,
			subscriptionLink: subReq.subLink,
			type: SubscriptionType.Subscriber,
			accessRights: accessRights || AccessRights.ReadAndWrite,
			subscriptionAuthorized: false
		};
		await subscriptionDb.addSubscription(subscription);
		// Todo update channel info
		return subReq;
	};

	authorizeSubscription = async (subscriptionLink: string, announcementLink: string): Promise<void> => {
		const authSub = this.streamsService.authorizeSubscription(subscriptionLink, announcementLink);
		// Todo update channel info
		return authSub;
	};
}
