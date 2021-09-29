import streams, { Address, Author, Subscriber, ChannelType } from '../streams-lib/wasm-node/iota_streams_wasm';
import * as fetch from 'node-fetch';
import { ILogger } from '../utils/logger';
import { StreamsConfig } from '../models/config';
import { fromBytes, toBytes } from '../utils/text';
import { ChannelAddress } from '../streams-lib/wasm-node/iota_streams_wasm';
import { MsgId } from '../streams-lib/wasm-node/iota_streams_wasm';

streams.set_panic_hook();

global.fetch = fetch as any;
global.Headers = (fetch as any).Headers;
global.Request = (fetch as any).Request;
global.Response = (fetch as any).Response;

export interface StreamsMessage {
	link: string;
	messageId: string;
	publicPayload: unknown;
	maskedPayload: unknown;
}

export class StreamsService {
	constructor(private readonly config: StreamsConfig, private readonly logger: ILogger) {}

	async create(
		seed?: string,
		presharedKey?: string
	): Promise<{
		seed: string;
		channelAddress: string;
		author: Author;
		presharedKey: string;
		keyloadLink: string;
		sequenceLink: string;
		pskId: string;
	}> {
		try {
			if (!seed) {
				seed = this.makeSeed(81);
			}

			const client = this.getClient(this.config.node);
			const author = streams.Author.from_client(client, seed, ChannelType.MultiBranch);
			const announceResponse = await author.clone().send_announce();
			const announcementAddress = announceResponse.link;
			const announcementLink = announcementAddress.copy().toString();
			const keys = streams.PublicKeys.new();
			const ids = streams.PskIds.new();
			let pskId: string = undefined;

			if (presharedKey) {
				pskId = author.clone().store_psk(presharedKey);
				ids.add(pskId);
			}

			const res = await author.clone().send_keyload(announcementAddress.copy(), ids, keys);
			const keyloadLink = res?.link.toString();
			const sequenceLink = res?.seqLink.toString();

			return {
				seed,
				channelAddress: announcementLink,
				author: author.clone(),
				presharedKey,
				keyloadLink,
				sequenceLink,
				pskId
			};
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not create the channel');
		}
	}

	async publishMessage(
		keyloadLink: string,
		subscription: Author | Subscriber,
		publicPayload: unknown,
		maskedPayload: unknown
	): Promise<{ link: string; messageId: string }> {
		try {
			const latestAddress = this.getChannelAddress(keyloadLink);
			const pubPayload = toBytes(JSON.stringify(publicPayload));
			const mPayload = toBytes(JSON.stringify(maskedPayload));

			const sendResponse = await subscription.clone().send_signed_packet(latestAddress, pubPayload, mPayload);
			const messageLink = sendResponse?.link;
			if (!messageLink) {
				throw new Error('could not send signed packet');
			}

			const linkDetails = await this.getClient(this.config.node)?.get_link_details(messageLink.copy());
			const messageId = linkDetails?.get_metadata()?.message_id;

			return {
				messageId,
				link: messageLink?.toString()
			};
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not add logs to the channel');
		}
	}

	// TODO #22 finalize implementation fetch_prev_msg does not work as expected
	async getMessage(subscription: Author | Subscriber, link: string): Promise<StreamsMessage> {
		const address = this.getChannelAddress(link);
		const messageResponse = await subscription.clone().receive_msg(address?.copy());
		const message = messageResponse.message;
		const publicPayload = message && fromBytes(message.get_public_payload());
		const maskedPayload = message && fromBytes(message.get_masked_payload());

		if (!publicPayload && !maskedPayload) {
			return null;
		}

		const linkDetails = await this.getClient(this.config.node)?.get_link_details(address?.copy());
		const messageId = linkDetails?.get_metadata()?.message_id;

		return {
			link,
			messageId,
			publicPayload: publicPayload && JSON.parse(publicPayload),
			maskedPayload: maskedPayload && JSON.parse(maskedPayload)
		};
	}

	async getMessages(subscription: Author | Subscriber): Promise<StreamsMessage[]> {
		try {
			let foundNewMessage = true;
			let streamsMessages: StreamsMessage[] = [];

			while (foundNewMessage) {
				let nextMessages: any = [];

				nextMessages = await subscription.clone().fetch_next_msgs();

				if (!nextMessages || nextMessages.length === 0) {
					foundNewMessage = false;
				}

				if (nextMessages && nextMessages.length > 0) {
					const cData: StreamsMessage[] = await Promise.all(
						nextMessages.map(async (messageResponse: streams.UserResponse) => {
							const address = messageResponse?.link;
							const link = address?.copy()?.toString();
							const message = messageResponse.message;
							const publicPayload = message && fromBytes(message.get_public_payload());
							const maskedPayload = message && fromBytes(message.get_masked_payload());

							try {
								if (!publicPayload && !maskedPayload) {
									return null;
								}
								const linkDetails = await this.getClient(this.config.node)?.get_link_details(address?.copy());
								const messageId = linkDetails?.get_metadata()?.message_id;

								return {
									link,
									messageId,
									publicPayload: publicPayload && JSON.parse(publicPayload),
									maskedPayload: maskedPayload && JSON.parse(maskedPayload)
								};
							} catch (e) {
								this.logger.error('could not parse maskedPayload');
								return null;
							}
						})
					);
					streamsMessages = [...streamsMessages, ...cData];
				}
			}

			return streamsMessages.filter((m) => m);
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not get logs from the channel');
		}
	}

	async requestSubscription(
		announcementLink: string,
		seed?: string,
		presharedKey?: string
	): Promise<{ seed: string; subscriptionLink?: string; subscriber: Subscriber; publicKey?: string; pskId?: string }> {
		try {
			const annAddress = this.getChannelAddress(announcementLink);

			if (!seed) {
				seed = this.makeSeed(81);
			}

			const client = this.getClient(this.config.node);
			const subscriber = streams.Subscriber.from_client(client, seed);
			await subscriber.clone().receive_announcement(annAddress.copy());
			let pskId: string = undefined;

			if (presharedKey) {
				// subscriber stores psk
				pskId = await subscriber.clone().store_psk(presharedKey);
				return {
					seed,
					subscriber: subscriber.clone(),
					pskId
				};
			}

			const response = await subscriber.clone().send_subscribe(annAddress.copy());
			const subscriptionLink = response.link;
			return {
				seed,
				subscriptionLink: subscriptionLink?.toString(),
				subscriber: subscriber.clone(),
				publicKey: subscriber.clone().get_public_key()
			};
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not request the subscription to the channel');
		}
	}

	async receiveSubscribe(subscriptionLink: string, author: Author) {
		const subscriptionAddress = this.getChannelAddress(subscriptionLink);
		await author.clone().receive_subscribe(subscriptionAddress);
	}

	async sendKeyload(
		anchorLink: string,
		publicKeys: string[],
		author: Author,
		pskId?: string
	): Promise<{ keyloadLink: string; sequenceLink: string }> {
		try {
			const anchorAddress = this.getChannelAddress(anchorLink);

			const keys = streams.PublicKeys.new();
			publicKeys.forEach((publicKey) => {
				keys.add(publicKey);
			});

			const ids = streams.PskIds.new();

			if (pskId) {
				ids.add(pskId);
			}

			const res = await author.clone().send_keyload(anchorAddress.copy(), ids, keys);
			const keyloadLink = res?.link?.toString();
			const sequenceLink = res?.seqLink?.toString();

			if (!keyloadLink) {
				throw new Error('could not send the keyload');
			}

			return { keyloadLink, sequenceLink };
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not authorize the subscription to the channel');
		}
	}

	async resetState(channelLink: string, seed: string, isAuthor: boolean): Promise<Subscriber> {
		const client = this.getClient(this.config.node);
		if (isAuthor) {
			throw new Error('not supported for authors');
		}
		const sub = Subscriber.from_client(client, seed);
		const channelAddress = this.getChannelAddress(channelLink);
		await sub.clone().receive_announcement(channelAddress);
		return sub;
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

	getChannelAddress(link: string): Address {
		const [channelAddr, msgId] = link.split(':');
		return new Address(ChannelAddress.parse(channelAddr), MsgId.parse(msgId));
	}

	private getClient(node: string): streams.Client {
		const options = new streams.SendOptions(node, true);
		return new streams.Client(node, options.clone());
	}
}
