import { StreamsService } from './streams-service';

export class SubscriptionService {
	streamsService: StreamsService;

	constructor(streamsService: StreamsService) {
		this.streamsService = streamsService;
	}

	getSubscriptions = async (announcementLink: string): Promise<void> => {
		return this.streamsService.getSubscriptions(announcementLink);
	};
	requestSubscription = async (announcementLink: string): Promise<void> => {
		return this.requestSubscription(announcementLink);
	};

	authorizeSubscription = async (subscriptionLink: string, announcementLink: string): Promise<void> => {
		return this.streamsService.authorizeSubscription(subscriptionLink, announcementLink);
	};
}
