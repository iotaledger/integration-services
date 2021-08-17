import { Author, Subscriber } from '../../streams-lib/wasm-node/iota_streams_wasm';
import * as SubscriptionDb from '../../database/subscription';
import { SubscriptionType } from '../../models/schemas/subscription';
import { subSeconds } from 'date-fns';
import { StreamsService } from '../../services/streams-service';

export class SubscriptionPool {
	private secondsToLive = 20;
	private interval: NodeJS.Timeout;
	authors: { identityId: string; channelAddress: string; author: Author; created: Date }[];
	subscribers: { identityId: string; channelAddress: string; subscriber: Subscriber; created: Date }[];

	constructor(private readonly streamsService: StreamsService, subscriptionExpiration: number, private readonly maxPoolSize = 65000) {
		this.authors = [];
		this.subscribers = [];
		// subscriptions should not live longer than one day
		if (subscriptionExpiration > 86400) {
			this.secondsToLive = 86400;
		} else {
			this.secondsToLive = subscriptionExpiration;
		}
	}

	startInterval() {
		this.interval = setInterval(() => this.clearObsoleteObjects(), this.secondsToLive * 1000);
	}

	stopInterval() {
		clearInterval(this.interval);
	}

	add(channelAddress: string, subscription: Author | Subscriber, identityId: string, isAuthor: boolean) {
		if (isAuthor) {
			if (this.authors.length === this.maxPoolSize) {
				this.authors.pop();
			}
			const newAuthor = { author: <Author>subscription, channelAddress, identityId, created: new Date(Date.now()) };
			this.authors = [newAuthor, ...this.authors];
		} else {
			if (this.subscribers.length === this.maxPoolSize) {
				this.subscribers.pop();
			}
			const newSubscriber = { subscriber: <Subscriber>subscription, channelAddress, identityId, created: new Date(Date.now()) };
			this.subscribers = [newSubscriber, ...this.subscribers];
		}
	}

	clearObsoleteObjects() {
		this.authors = this.authors.filter((author) => author.created > subSeconds(new Date(Date.now()), this.secondsToLive));
		this.subscribers = this.subscribers.filter((subscriber) => subscriber.created > subSeconds(new Date(Date.now()), this.secondsToLive));
	}

	async get(channelAddress: string, identityId: string, isAuthor: boolean): Promise<Author | Subscriber> {
		const predicate = (pool: any) => pool.identityId === identityId && pool.channelAddress === channelAddress;
		let subscription = null;

		if (isAuthor) {
			const found = this.authors.filter(predicate)?.[0];
			if (found) {
				found.created = new Date(Date.now()); // update timetolive
				subscription = found.author;
			}
		} else {
			const found = this.subscribers.filter(predicate)?.[0];
			if (found) {
				found.created = new Date(Date.now()); // update timetolive
				subscription = found?.subscriber;
			}
		}
		if (!subscription) {
			// try to restore subscription from state in db
			subscription = await this.restoreSubscription(channelAddress, identityId);
			this.add(channelAddress, subscription, identityId, isAuthor);
		}
		return subscription;
	}

	private async restoreSubscription(channelAddress: string, identityId: string) {
		const sub = await SubscriptionDb.getSubscription(channelAddress, identityId);
		if (!sub?.state) {
			throw new Error(`no subscription found for channelAddress: ${channelAddress} and identityId: ${identityId}`);
		}

		const isAuthor = sub.type === SubscriptionType.Author;
		return this.streamsService.importSubscription(sub.state, isAuthor);
	}
}
