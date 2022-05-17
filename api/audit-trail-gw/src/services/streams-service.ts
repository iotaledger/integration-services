import streams, {
	Address,
	Author,
	Subscriber,
	ChannelType as StreamsChannelType,
	StreamsClient,
	ClientBuilder,
	PublicKeys,
	PskIds,
	UserResponse,
	ChannelAddress,
	MsgId
} from '@iota/streams/node/streams_wasm';
import * as fetch from 'node-fetch';
import { ILogger } from '@iota/is-shared-modules/lib/utils/logger';
import { StreamsConfig } from '../models/config';
import { fromBytes, toBytes } from '@iota/is-shared-modules/lib/utils/text';
import * as crypto from 'crypto';
import { ChannelType } from '@iota/is-shared-modules/lib/models/schemas/channel-info';

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
		isPublic: boolean,
		seed?: string,
		presharedKey?: string
	): Promise<{
		seed: string;
		channelAddress: string;
		author: Author;
		publicKey: string;
		presharedKey: string;
		keyloadLink: string;
		sequenceLink: string;
		pskId: string;
	}> {
		try {
			if (!seed) {
				seed = this.makeSeed(81);
			}
			const client = await this.getClient(this.config.node, this.config.permaNode);
			let author;
			if (isPublic) {
				author = Author.fromClient(client, seed, StreamsChannelType.SingleDepth);
			} else {
				author = Author.fromClient(client, seed, StreamsChannelType.MultiBranch);
			}
			const announceResponse = await author.clone().send_announce();
			const announcementAddress = announceResponse.link;
			const announcementLink = announcementAddress.copy().toString();
			const keys = new PublicKeys();
			const ids = PskIds.new();
			let pskId: string = undefined;
			const publicKey = author.get_public_key();

			if (presharedKey) {
				pskId = author.clone().store_psk(presharedKey);
				ids.add(pskId);
			}

			const res = await author.clone().send_keyload(announcementAddress.copy(), ids, keys);
			const keyloadLink = res?.link.toString();
			const sequenceLink = res?.seqLink?.toString();

			return {
				seed,
				channelAddress: announcementLink,
				author: author.clone(),
				presharedKey,
				publicKey,
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
			const pubPayload = publicPayload ? toBytes(JSON.stringify(publicPayload)) : new Uint8Array();
			const mPayload = maskedPayload ? toBytes(JSON.stringify(maskedPayload)) : new Uint8Array();
			const sendResponse = await subscription.clone().send_signed_packet(latestAddress, pubPayload, mPayload);
			const messageLink = sendResponse?.link;
			if (!messageLink) {
				throw new Error('could not send signed packet');
			}
			const client = await this.getClient(this.config.node, this.config.permaNode);
			const linkDetails = await client?.get_link_details(messageLink.copy());
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

	async getMessage(subscription: Author | Subscriber, link: string): Promise<StreamsMessage> {
		const address = this.getChannelAddress(link);
		const messageResponse = await subscription.clone().receive_msg(address?.copy());
		const message = messageResponse.message;
		const publicPayload = message && fromBytes(message.get_public_payload());
		const maskedPayload = message && fromBytes(message.get_masked_payload());

		if (!publicPayload && !maskedPayload) {
			return null;
		}
		const client = await this.getClient(this.config.node, this.config.permaNode);
		const linkDetails = await client?.get_link_details(address?.copy());
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
						nextMessages.map(async (messageResponse: UserResponse) => {
							const address = messageResponse?.link;
							const link = address?.copy()?.toString();
							const message = messageResponse.message;
							const publicPayload = message && fromBytes(message.get_public_payload());
							const maskedPayload = message && fromBytes(message.get_masked_payload());

							try {
								if (!publicPayload && !maskedPayload) {
									return null;
								}
								const client = await this.getClient(this.config.node, this.config.permaNode);
								const linkDetails = await client?.get_link_details(address?.copy());
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
		type: ChannelType,
		seed?: string,
		presharedKey?: string
	): Promise<{ seed: string; subscriptionLink?: string; subscriber: Subscriber; publicKey?: string; pskId?: string }> {
		try {
			const annAddress = this.getChannelAddress(announcementLink);

			if (!seed) {
				seed = this.makeSeed(81);
			}

			const client = await this.getClient(this.config.node, this.config.permaNode);
			const subscriber = Subscriber.fromClient(client, seed);
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

			let subscriptionLink = undefined;

			if (type !== ChannelType.public) {
				const response = await subscriber.clone().send_subscribe(annAddress.copy());
				subscriptionLink = response.link;
			}

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
	): Promise<{ keyloadLink: string; sequenceLink?: string }> {
		try {
			const anchorAddress = this.getChannelAddress(anchorLink);

			const keys = new PublicKeys();
			publicKeys.forEach((publicKey) => {
				keys.add(publicKey);
			});

			const ids = PskIds.new();

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

	async resetState(_channelLink: string, subscription: Author | Subscriber, isAuthor: boolean): Promise<Author | Subscriber> {
		if (isAuthor) {
			throw new Error('not supported for authors');
			// TODO#196 this method is currently not exposed
			// const client = this.getClient(this.config.node);
		}
		(subscription as Subscriber).clone().reset_state();
		return subscription;
	}

	makeSeed(size: number) {
		const alphabet = 'abcdefghijklmnopqrstuvwxyz';
		let seed = '';
		for (let i = 9; i < size; i++) {
			seed += alphabet[crypto.randomInt(0, alphabet.length)];
		}
		return seed;
	}

	async importSubscription(state: string, isAuthor: boolean): Promise<Author | Subscriber> {
		try {
			const password = this.config.statePassword;
			const client = await this.getClient(this.config.node, this.config.permaNode);
			if (isAuthor) {
				return Author.import(client, toBytes(state), password);
			}

			return Subscriber.import(client, toBytes(state), password);
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

	private async getClient(node: string, permaNode?: string): Promise<StreamsClient> {
		let builder = await new ClientBuilder().node(node);

		if (permaNode) {
			builder = builder.permanode(permaNode);
		}

		const client = await builder.build();
		return StreamsClient.fromClient(client);
	}
}
