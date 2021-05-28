import { ChannelData } from '../models/types/channel-data';
import streams, { Address, Author, Subscriber } from '../streams-lib/wasm-node/iota_streams_wasm';
import { fromBytes, toBytes } from '../utils/text';

streams.set_panic_hook();

export class StreamsService {
	private readonly node: string;

	constructor(node: string) {
		this.node = node;
	}

	importSubscription = (state: string, isAuthor: boolean, password: string): Author | Subscriber => {
		try {
			const options = new streams.SendOptions(1, true, 1);

			const client = new streams.Client(this.node, options.clone());
			if (isAuthor) {
				return streams.Author.import(client, toBytes(state), password);
			}
			return streams.Subscriber.import(client, toBytes(state), password);
		} catch (error) {
			console.log('Error from streams sdk:', error);
			throw new Error('could not import the subscription object');
		}
	};

	exportSubscription = (subscription: Author | Subscriber, password: string): string => {
		try {
			return fromBytes(subscription.clone().export(password));
		} catch (error) {
			console.log('Error from streams sdk:', error);
			throw new Error('could not export the subscription object');
		}
	};

	create = async (seed?: string): Promise<{ seed: string; channelAddress: string; author: Author }> => {
		try {
			const options = new streams.SendOptions(1, true, 1);
			if (!seed) {
				seed = this.makeSeed(81);
			}
			const author = new streams.Author(this.node, seed, options, false);

			const response = await author.clone().send_announce();
			const ann_link = response.get_link();

			return {
				seed,
				channelAddress: ann_link.to_string(),
				author
			};
		} catch (error) {
			console.log('Error from streams sdk:', error);
			throw new Error('could not create the channel');
		}
	};

	addLogs = async (
		latestLink: string,
		publicPayload: string,
		maskedPayload: string,
		subscription: Author | Subscriber
	): Promise<{ link: string; subscription: Author | Subscriber }> => {
		try {
			const latestAddress = Address.from_string(latestLink);
			const pPayload = toBytes(publicPayload);
			const mPayload = toBytes(maskedPayload);

			let response: any = null;
			await subscription.clone().sync_state();
			response = await subscription.clone().send_tagged_packet(latestAddress, pPayload, mPayload);
			const tag_link = response.get_link();

			return {
				link: tag_link.to_string(),
				subscription
			};
		} catch (error) {
			console.log('Error from streams sdk:', error);
			throw new Error('could not add logs to the channel');
		}
	};

	getLogs = async (
		subscription: Author | Subscriber
	): Promise<{ channelData: ChannelData[]; subscription: Author | Subscriber; latestLink: string }> => {
		let foundNewMessage = true;
		let channelData: ChannelData[] = [];
		let latestLink = '';

		while (foundNewMessage) {
			let next_msgs: any = [];

			next_msgs = await subscription.clone().fetch_next_msgs();

			if (next_msgs.length === 0) {
				foundNewMessage = false;
			} else {
				latestLink = next_msgs[next_msgs.length - 1]?.get_link()?.to_string();
			}

			if (next_msgs && next_msgs.length > 0) {
				const cData = next_msgs.map((userResponse: any) => {
					const link = userResponse?.get_link()?.to_string();
					const message = userResponse.get_message();
					const publicPayload = message && fromBytes(message.get_public_payload());
					const maskedPayload = message && fromBytes(message.get_masked_payload());

					return {
						link,
						publicPayload,
						maskedPayload
					};
				});
				channelData = [...channelData, ...cData];
			}
		}

		return {
			channelData,
			subscription,
			latestLink
		};
	};

	requestSubscription = async (
		announcementLink: string,
		seed?: string
	): Promise<{ seed: string; subscriptionLink: string; subscriber: Subscriber }> => {
		try {
			const annAddress = streams.Address.from_string(announcementLink);
			const options = new streams.SendOptions(1, true, 1);

			if (!seed) {
				seed = this.makeSeed(81);
			}

			const subscriber = new streams.Subscriber(this.node, seed, options);
			let ann_link_copy = annAddress.copy();
			await subscriber.clone().receive_announcement(ann_link_copy);

			ann_link_copy = annAddress.copy();
			const response = await subscriber.clone().send_subscribe(ann_link_copy);
			const sub_link = response.get_link();
			return { seed, subscriptionLink: sub_link.to_string(), subscriber };
		} catch (error) {
			console.log('Error from streams sdk:', error);
			throw new Error('could not request the subscription to the channel');
		}
	};

	authorizeSubscription = async (
		channelAddress: string,
		subscriptionLink: string,
		author: Author
	): Promise<{ keyloadLink: string; author: Author }> => {
		try {
			const announcementAddress = streams.Address.from_string(channelAddress);
			const subscriptionAddress = streams.Address.from_string(subscriptionLink);
			await author.clone().receive_subscribe(subscriptionAddress);

			const response = await author.clone().send_keyload_for_everyone(announcementAddress);
			const keyload_link = response.get_link();
			return { keyloadLink: keyload_link.to_string(), author };
		} catch (error) {
			console.log('Error from streams sdk:', error);
			throw new Error('could not authorize the subscription to the channel');
		}
	};

	makeSeed(size: number) {
		const alphabet = 'abcdefghijklmnopqrstuvwxyz';
		let seed = '';
		for (let i = 9; i < size; i++) {
			seed += alphabet[Math.floor(Math.random() * alphabet.length)];
		}
		return seed;
	}
}
