import streams, { Author, Subscriber } from '../../streams-lib/wasm-node/iota_streams_wasm';
import * as SubscriptionDb from '../../database/subscription';
import { SubscriptionType } from '../../models/types/subscription';
import { toBytes } from '../../utils/text';

// TODO#39 use more robust object pool: https://github.com/electricessence/TypeScript.NET/blob/master/source/System/Disposable/ObjectPool.ts
export class SubscriptionPool {
	password = 'test';
	node = 'https://api.lb-0.testnet.chrysalis2.com/';

	private authors: { userId: string; channelAddress: string; author: Author }[] = [];
	private subscribers: { userId: string; channelAddress: string; subscriber: Subscriber }[] = [];

	add(subscription: Author | Subscriber, userId: string, channelAddress: string, isAuthor: boolean) {
		if (isAuthor) {
			this.authors = [...this.authors, { author: <Author>subscription, channelAddress, userId }];
		} else {
			this.subscribers = [...this.subscribers, { subscriber: <Subscriber>subscription, channelAddress, userId }];
		}
	}

	async restoreSubscription(channelAddress: string, userId: string) {
		const sub = await SubscriptionDb.getSubscription(channelAddress, userId);
		if (!sub.state) {
			throw new Error('No state found to restore!');
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
		return subscription;
	}
}
