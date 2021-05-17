import streams, { Author, Subscriber } from '../../streams-lib/wasm-node/iota_streams_wasm';
import * as SubscriptionDb from '../../database/subscription';
import { SubscriptionType } from '../../models/types/subscription';
import { toBytes } from '../../utils/text';

// TODO#39 use more robust object pool: https://github.com/electricessence/TypeScript.NET/blob/master/source/System/Disposable/ObjectPool.ts
export class SubscriptionPool {
	private static instance: SubscriptionPool;
	private readonly password = 'test123';
	private readonly node = 'https://api.lb-0.testnet.chrysalis2.com/';
	private authors: { userId: string; channelAddress: string; author: Author }[];
	private subscribers: { userId: string; channelAddress: string; subscriber: Subscriber }[];

	private constructor() {
		this.authors = [];
		this.subscribers = [];
	}

	public static getInstance(): SubscriptionPool {
		if (!SubscriptionPool.instance) {
			SubscriptionPool.instance = new SubscriptionPool();
		}
		return SubscriptionPool.instance;
	}

	add(subscription: Author | Subscriber, userId: string, channelAddress: string, isAuthor: boolean) {
		if (isAuthor) {
			this.authors = [...this.authors, { author: <Author>subscription, channelAddress, userId }];
			console.log('added author to the pool');
		} else {
			this.subscribers = [...this.subscribers, { subscriber: <Subscriber>subscription, channelAddress, userId }];
			console.log('added subscriber to the pool');
		}
	}

	async restoreSubscription(channelAddress: string, userId: string) {
		const sub = await SubscriptionDb.getSubscription(channelAddress, userId);
		if (!sub?.state) {
			// TODO handle properly
			console.log('No state found to restore!');
			return;
		}
		const isAuthor = sub.type === SubscriptionType.Author;

		const options = new streams.SendOptions(9, true, 1);
		const client = new streams.Client(this.node, options.clone());

		if (isAuthor) {
			return Author.import(client, toBytes(sub.state), this.password);
		} else {
			return Subscriber.import(client, toBytes(sub.state), this.password);
		}
	}

	async get(channelAddress: string, userId: string, isAuthor: boolean): Promise<Author | Subscriber> {
		const predicate = (pool: any) => pool.userId === userId && pool.channelAddress === channelAddress;
		let subscription = null;
		if (isAuthor) {
			subscription = this.authors.filter(predicate)[0]?.author;
		} else {
			subscription = this.subscribers.filter(predicate)[0]?.subscriber;
		}
		if (!subscription) {
			// try to restore subscription from state in db
			subscription = await this.restoreSubscription(channelAddress, userId);
		}
		console.log('found subscription in pool: ', subscription);

		return subscription;
	}
}
