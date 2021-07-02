import { ChannelData, ChannelLog } from '../models/types/channel-data';
import streams, { Address, Author, Subscriber } from '../streams-lib/wasm-node/iota_streams_wasm';
import * as fetch from 'node-fetch';
import { ILogger } from '../utils/logger';
import { StreamsConfig } from '../models/config';

streams.set_panic_hook();

global.fetch = fetch as any;
global.Headers = (fetch as any).Headers;
global.Request = (fetch as any).Request;
global.Response = (fetch as any).Response;

export class StreamsService {
	constructor(private readonly config: StreamsConfig, private readonly logger: ILogger) {}

	importSubscription = (state: string, isAuthor: boolean): Author | Subscriber => {
		try {
			const password = this.config.statePassword;
			const client = this.getClient(this.config.node);
			if (isAuthor) {
				return streams.Author.import(client, this.toBytes(state), password);
			}

			return streams.Subscriber.import(client, this.toBytes(state), password);
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not import the subscription object');
		}
	};

	exportSubscription = (subscription: Author | Subscriber, password: string): string => {
		try {
			return this.fromBytes(subscription.clone().export(password));
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not export the subscription object');
		}
	};

	create = async (seed?: string): Promise<{ seed: string; channelAddress: string; author: Author }> => {
		try {
			if (!seed) {
				seed = this.makeSeed(81);
			}
			const client = this.getClient(this.config.node);
			const author = streams.Author.from_client(client, seed, streams.ChannelType.SingleBranch);
			const response = await author.clone().send_announce();
			const ann_link = response.get_link();

			return {
				seed,
				channelAddress: ann_link.to_string(),
				author: author.clone()
			};
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not create the channel');
		}
	};

	addLogs = async (
		latestLink: string,
		subscription: Author | Subscriber,
		channelLog: ChannelLog
	): Promise<{ link: string; subscription: Author | Subscriber; prevLogs: ChannelData[] | undefined }> => {
		try {
			// fetch prev logs before writing new data to the channel
			const prevLogs = await this.getLogs(subscription.clone());
			let link = latestLink;
			if (prevLogs?.latestLink) {
				link = prevLogs.latestLink;
			}
			const latestAddress = Address.from_string(link);
			const mPayload = this.toBytes(JSON.stringify(channelLog));

			await subscription.clone().sync_state();
			const response = await subscription.clone().send_tagged_packet(latestAddress, this.toBytes(''), mPayload);
			const tag_link = response?.get_link();
			if (!tag_link) {
				throw new Error('could not send tagged packet');
			}

			return {
				link: tag_link?.to_string(),
				prevLogs: prevLogs?.channelData,
				subscription
			};
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not add logs to the channel');
		}
	};

	// TODO consider if channel is encrypted or not when getting adding data to channel
	getLogs = async (
		subscription: Author | Subscriber
	): Promise<{ channelData: ChannelData[]; subscription: Author | Subscriber; latestLink: string }> => {
		try {
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
					const cData: ChannelData[] = next_msgs
						.map((userResponse: any) => {
							const link = userResponse?.get_link()?.to_string();
							const message = userResponse.get_message();
							const maskedPayload = message && this.fromBytes(message.get_masked_payload());

							try {
								const channelData: ChannelData = {
									link,
									channelLog: JSON.parse(maskedPayload)
								};
								return channelData;
							} catch (e) {
								this.logger.error('could not parse maskedPayload');
								// return;
							}
						})
						.filter((c: ChannelData | undefined) => c);
					channelData = [...channelData, ...cData];
				}
			}

			return {
				channelData,
				subscription,
				latestLink
			};
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not get logs from the channel');
		}
	};

	requestSubscription = async (
		announcementLink: string,
		seed?: string
	): Promise<{ seed: string; subscriptionLink: string; subscriber: Subscriber; publicKey: string }> => {
		try {
			const annAddress = streams.Address.from_string(announcementLink);

			if (!seed) {
				seed = this.makeSeed(81);
			}
			const client = this.getClient(this.config.node);
			const subscriber = streams.Subscriber.from_client(client, seed);

			let ann_link_copy = annAddress.copy();
			await subscriber.clone().receive_announcement(ann_link_copy);

			ann_link_copy = annAddress.copy();
			const response = await subscriber.clone().send_subscribe(ann_link_copy);
			const sub_link = response.get_link();
			return { seed, subscriptionLink: sub_link.to_string(), subscriber: subscriber.clone(), publicKey: subscriber.clone().get_public_key() };
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not request the subscription to the channel');
		}
	};

	authorizeSubscription = async (
		channelAddress: string,
		subscriptionLink: string,
		_publicKey: string,
		author: Author
	): Promise<{ keyloadLink: string; sequenceLink: string; author: Author }> => {
		try {
			const announcementAddress = streams.Address.from_string(channelAddress);
			const subscriptionAddress = streams.Address.from_string(subscriptionLink);
			await author.clone().receive_subscribe(subscriptionAddress);

			// TODO#https://github.com/iotaledger/streams/issues/105 this will be used for multi branching
			// const keys = streams.PublicKeys.new();
			// keys.add(publicKey);
			// const ids = streams.PskIds.new();
			// const res = await author.clone().send_keyload(announcementAddress, ids, keys);

			const res = await author.clone().send_keyload_for_everyone(announcementAddress);
			const keyloadLink = res?.get_link()?.to_string();
			const sequenceLink = res?.get_seq_link()?.to_string();

			if (!keyloadLink) {
				throw new Error('could not send the keyload');
			}

			return { keyloadLink, sequenceLink, author };
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
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

	toBytes(str: string): Uint8Array {
		const bytes = new Uint8Array(str.length);
		for (let i = 0; i < str.length; ++i) {
			bytes[i] = str.charCodeAt(i);
		}
		return bytes;
	}

	fromBytes(bytes: any): string {
		let str = '';
		for (let i = 0; i < bytes.length; ++i) {
			str += String.fromCharCode(bytes[i]);
		}
		return str;
	}

	private getClient(node: string): streams.Client {
		const options = new streams.SendOptions(node, true);
		return new streams.Client(node, options.clone());
	}
}
