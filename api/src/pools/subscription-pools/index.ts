import streams, { Author, Subscriber } from '../../streams-lib/wasm-node/iota_streams_wasm';
import * as SubscriptionDb from '../../database/subscription';
import { SubscriptionType } from '../../models/types/subscription';
import { toBytes } from '../../utils/text';

// TODO#39 use more robust object pool: https://github.com/electricessence/TypeScript.NET/blob/master/source/System/Disposable/ObjectPool.ts
export class SubscriptionPool {
	private static instance: SubscriptionPool;
	private readonly node: string;
	private authors: { userId: string; channelAddress: string; author: Author }[];
	private subscribers: { userId: string; channelAddress: string; subscriber: Subscriber }[];

	private constructor(node: string) {
		this.authors = [];
		this.subscribers = [];
		this.node = node;
	}

	public static getInstance(node: string): SubscriptionPool {
		if (!SubscriptionPool.instance) {
			SubscriptionPool.instance = new SubscriptionPool(node);
		}
		return SubscriptionPool.instance;
	}

	add(channelAddress: string, subscription: Author | Subscriber, userId: string, isAuthor: boolean) {
		if (isAuthor) {
			this.authors = [...this.authors, { author: <Author>subscription, channelAddress, userId }];
		} else {
			this.subscribers = [...this.subscribers, { subscriber: <Subscriber>subscription, channelAddress, userId }];
		}
	}

	async restoreSubscription(channelAddress: string, userId: string, password: string) {
		const sub = await SubscriptionDb.getSubscription(channelAddress, userId);
		if (!sub?.state) {
			throw new Error(`no subscription found for channelAddress: ${channelAddress} and userId: ${userId}`);
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

	async get(channelAddress: string, userId: string, isAuthor: boolean, password: string): Promise<Author | Subscriber> {
		const predicate = (pool: any) => pool.userId === userId && pool.channelAddress === channelAddress;
		let subscription = null;
		if (isAuthor) {
			subscription = this.authors.filter(predicate)?.[0]?.author;
		} else {
			subscription = this.subscribers.filter(predicate)?.[0]?.subscriber;
		}
		if (!subscription) {
			// try to restore subscription from state in db
			subscription = await this.restoreSubscription(channelAddress, userId, password);
		}

		return subscription;
	}
}
