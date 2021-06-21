import streams, { Author, Subscriber } from '../../streams-lib/wasm-node/iota_streams_wasm';
import * as SubscriptionDb from '../../database/subscription';
import { SubscriptionType } from '../../models/types/subscription';
import { toBytes } from '../../utils/text';
import { subSeconds } from 'date-fns';

export class SubscriptionPool {
	private secondsToLive = 20;
	private interval: NodeJS.Timeout;
	authors: { identityId: string; channelAddress: string; author: Author; created: Date }[];
	subscribers: { identityId: string; channelAddress: string; subscriber: Subscriber; created: Date }[];

	constructor(private readonly node: string, private readonly maxPoolSize = 65000) {
		this.authors = [];
		this.subscribers = [];
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

	async restoreSubscription(channelAddress: string, identityId: string, password: string) {
		const sub = await SubscriptionDb.getSubscription(channelAddress, identityId);
		if (!sub?.state) {
			throw new Error(`no subscription found for channelAddress: ${channelAddress} and identityId: ${identityId}`);
		}

		const isAuthor = sub.type === SubscriptionType.Author;
		const options = new streams.SendOptions(9, true, 1);
		const client = new streams.Client(this.node, options.clone());

		if (isAuthor) {
			return Author.import(client, toBytes(sub.state), password);
		} else {
			return Subscriber.import(client, toBytes(sub.state), password);
		}
	}

	async get(channelAddress: string, identityId: string, isAuthor: boolean, password: string): Promise<Author | Subscriber> {
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
			subscription = await this.restoreSubscription(channelAddress, identityId, password);
			this.add(channelAddress, subscription, identityId, isAuthor);
		}
		return subscription;
	}
}
