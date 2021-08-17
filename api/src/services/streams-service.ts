import { ChannelData, ChannelLog } from '../models/types/channel-data';
import streams, { Address, Author, Subscriber, ChannelType } from '../streams-lib/wasm-node/iota_streams_wasm';
import * as fetch from 'node-fetch';
import { ILogger } from '../utils/logger';
import { StreamsConfig } from '../models/config';
import { fromBytes, toBytes } from '../utils/text';
import { isEmpty } from 'lodash';

streams.set_panic_hook();

global.fetch = fetch as any;
global.Headers = (fetch as any).Headers;
global.Request = (fetch as any).Request;
global.Response = (fetch as any).Response;

export interface IPayload {
	payload?: any;
	metadata?: any;
	creationDate?: any;
	type?: string;
}

export class StreamsService {
	constructor(private readonly config: StreamsConfig, private readonly logger: ILogger) {}

	async create(
		seed?: string,
		presharedKey?: string
	): Promise<{ seed: string; channelAddress: string; author: Author; presharedKey: string; keyloadLink: string }> {
		try {
			if (!seed) {
				seed = this.makeSeed(81);
			}

			const client = this.getClient(this.config.node);
			const author = streams.Author.from_client(client, seed, ChannelType.MultiBranch);
			const announceResponse = await author.clone().send_announce();
			const announcementAddress = announceResponse.get_link();
			const announcementLink = announcementAddress.copy().to_string();
			const keys = streams.PublicKeys.new();
			const ids = streams.PskIds.new();

			if (presharedKey) {
				const id = author.clone().store_psk(presharedKey);
				ids.add(id);
			}

			const res = await author.clone().send_keyload(announcementAddress.copy(), ids, keys);
			const keyloadAddress = res?.get_link();
			const keyloadLink = keyloadAddress.copy().to_string();

			return {
				seed,
				channelAddress: announcementLink,
				author: author.clone(),
				presharedKey,
				keyloadLink
			};
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not create the channel');
		}
	}

	async addLogs(
		keyloadLink: string,
		subscription: Author | Subscriber,
		channelLog: ChannelLog,
		_isPrivate?: boolean
	): Promise<{ link: string; messageId: string; subscription: Author | Subscriber }> {
		try {
			const latestAddress = Address.from_string(keyloadLink);
			const { encryptedData, publicData } = this.getPayloads(channelLog);
			const pubPayload = toBytes(JSON.stringify(publicData));
			const mPayload = toBytes(JSON.stringify(encryptedData));

			const sendResponse = await subscription.clone().send_signed_packet(latestAddress, pubPayload, mPayload);
			const messageLink = sendResponse?.get_link();
			if (!messageLink) {
				throw new Error('could not send signed packet');
			}

			const linkDetails = await this.getClient(this.config.node)?.get_link_details(messageLink.copy());
			const messageId = linkDetails?.get_metadata()?.message_id;

			return {
				messageId,
				link: messageLink?.to_string(),
				subscription
			};
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not add logs to the channel');
		}
	}

	async getLogs(subscription: Author | Subscriber): Promise<{ channelData: ChannelData[]; subscription: Author | Subscriber }> {
		try {
			let foundNewMessage = true;
			let channelData: ChannelData[] = [];

			while (foundNewMessage) {
				let nextMessages: any = [];

				nextMessages = await subscription.clone().fetch_next_msgs();

				if (!nextMessages || nextMessages.length === 0) {
					foundNewMessage = false;
				}

				if (nextMessages && nextMessages.length > 0) {
					const cData: ChannelData[] = nextMessages
						.map((messageResponse: any) => {
							const link = messageResponse?.get_link()?.to_string();
							const message = messageResponse.get_message();
							const publicPayload = message && fromBytes(message.get_public_payload());
							const maskedPayload = message && fromBytes(message.get_masked_payload());

							try {
								if (!maskedPayload) {
									return null;
								}

								const channelLog = this.getChannelLog(JSON.parse(publicPayload), JSON.parse(maskedPayload));

								return {
									link,
									channelLog
								};
							} catch (e) {
								this.logger.error('could not parse maskedPayload');
								return null;
							}
						})
						.filter((c: ChannelData | null) => c);
					channelData = [...channelData, ...cData];
				}
			}

			return {
				channelData,
				subscription
			};
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not get logs from the channel');
		}
	}

	async requestSubscription(
		announcementLink: string,
		seed?: string,
		presharedKey?: string
	): Promise<{ seed: string; subscriptionLink?: string; subscriber: Subscriber; publicKey?: string }> {
		try {
			const annAddress = streams.Address.from_string(announcementLink);

			if (!seed) {
				seed = this.makeSeed(81);
			}

			const client = this.getClient(this.config.node);
			const subscriber = streams.Subscriber.from_client(client, seed);
			await subscriber.clone().receive_announcement(annAddress.copy());

			if (presharedKey) {
				// subscriber stores psk
				await subscriber.clone().store_psk(presharedKey);
				return {
					seed,
					subscriber
				};
			}

			const response = await subscriber.clone().send_subscribe(annAddress.copy());
			const subscriptionLink = response.get_link();
			return { seed, subscriptionLink: subscriptionLink.to_string(), subscriber: subscriber.clone(), publicKey: subscriber.clone().get_public_key() };
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not request the subscription to the channel');
		}
	}

	async receiveSubscribe(subscriptionLink: string, author: Author) {
		const subscriptionAddress = streams.Address.from_string(subscriptionLink);
		await author.clone().receive_subscribe(subscriptionAddress);
	}

	async sendKeyload(
		anchorLink: string,
		publicKeys: string[],
		author: Author,
		presharedKey?: string
	): Promise<{ keyloadLink: string; sequenceLink: string; author: Author }> {
		try {
			const anchorAddress = streams.Address.from_string(anchorLink);

			const keys = streams.PublicKeys.new();
			publicKeys.forEach((publicKey) => {
				keys.add(publicKey);
			});

			const ids = streams.PskIds.new();

			if (presharedKey) {
				const id = author.clone().store_psk(presharedKey);
				ids.add(id);
			}

			const res = await author.clone().send_keyload(anchorAddress.copy(), ids, keys);
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
	}

	makeSeed(size: number) {
		const alphabet = 'abcdefghijklmnopqrstuvwxyz';
		let seed = '';
		for (let i = 9; i < size; i++) {
			seed += alphabet[Math.floor(Math.random() * alphabet.length)];
		}
		return seed;
	}

	importSubscription(state: string, isAuthor: boolean): Author | Subscriber {
		try {
			const password = this.config.statePassword;
			const client = this.getClient(this.config.node);
			if (isAuthor) {
				return streams.Author.import(client, toBytes(state), password);
			}

			return streams.Subscriber.import(client, toBytes(state), password);
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not import the subscription object');
		}
	}

	exportSubscription(subscription: Author | Subscriber, password: string): string {
		try {
			return fromBytes(subscription.clone().export(password));
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not export the subscription object');
		}
	}

	private getChannelLog(publicPayload: IPayload, encryptedPayload: IPayload): ChannelLog {
		const hasPublicPayload = !isEmpty(publicPayload.payload);
		return {
			type: hasPublicPayload ? publicPayload.type : encryptedPayload.type,
			metadata: publicPayload.metadata,
			creationDate: hasPublicPayload ? publicPayload.creationDate : encryptedPayload.creationDate,
			payload: encryptedPayload.payload,
			publicPayload: publicPayload.payload
		};
	}

	private getPayloads(channelLog: ChannelLog) {
		let encryptedData: IPayload = {
			payload: channelLog.payload
		};
		let publicData: IPayload = {
			metadata: channelLog.metadata
		};

		if (channelLog.publicPayload) {
			publicData = {
				...publicData,
				payload: channelLog.publicPayload,
				type: channelLog.type
			};
		} else {
			encryptedData = {
				...encryptedData,
				type: channelLog.type
			};
		}
		return {
			encryptedData,
			publicData
		};
	}

	private getClient(node: string): streams.Client {
		const options = new streams.SendOptions(node, true);
		return new streams.Client(node, options.clone());
	}
}
