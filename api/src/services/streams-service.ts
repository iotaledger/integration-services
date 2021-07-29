import { ChannelData, ChannelLog } from '../models/types/channel-data';
import streams, { Address, Author, Subscriber, ChannelType } from '../streams-lib/wasm-node/iota_streams_wasm';
import * as fetch from 'node-fetch';
import { ILogger } from '../utils/logger';
import { StreamsConfig } from '../models/config';
import { fromBytes, toBytes } from '../utils/text';
import { AccessRights } from '../models/types/subscription';

streams.set_panic_hook();

global.fetch = fetch as any;
global.Headers = (fetch as any).Headers;
global.Request = (fetch as any).Request;
global.Response = (fetch as any).Response;

export class StreamsService {
	constructor(private readonly config: StreamsConfig, private readonly logger: ILogger) {}

	create = async (seed?: string): Promise<{ seed: string; channelAddress: string; author: Author }> => {
		try {
			if (!seed) {
				seed = this.makeSeed(81);
			}
			const client = this.getClient(this.config.node);
			const author = streams.Author.from_client(client, seed, ChannelType.MultiBranch);
			const announceResponse = await author.clone().send_announce();
			const announcementAddress = announceResponse.get_link();

			return {
				seed,
				channelAddress: announcementAddress.copy().to_string(),
				author: author.clone()
			};
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not create the channel');
		}
	};

	addLogs = async (
		keyloadLink: string,
		subscription: Author | Subscriber,
		channelLog: ChannelLog,
		accessRights: AccessRights,
		_isPrivate?: boolean
	): Promise<{ link: string; subscription: Author | Subscriber; prevLogs: ChannelData[] | undefined }> => {
		try {
			let prevLogs = undefined;

			if (accessRights === AccessRights.Read) {
				throw new Error('not allowed to add logs to the channel');
			} else if (accessRights === AccessRights.Write) {
				await subscription.clone().sync_state();
			} else {
				// fetch prev logs before writing new data to the channel
				prevLogs = await this.getLogs(subscription.clone());
			}

			let link = keyloadLink;
			const latestAddress = Address.from_string(link);
			const mPayload = toBytes(JSON.stringify(channelLog));

			const sendResponse = await subscription.clone().send_signed_packet(latestAddress, toBytes(''), mPayload);
			const messageLink = sendResponse?.get_link();
			if (!messageLink) {
				throw new Error('could not send signed packet');
			}

			return {
				link: messageLink?.to_string(),
				prevLogs: prevLogs?.channelData,
				subscription
			};
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not add logs to the channel');
		}
	};

	// TODO consider if channel is encrypted or not when getting adding data to channel
	getLogs = async (subscription: Author | Subscriber): Promise<{ channelData: ChannelData[]; subscription: Author | Subscriber }> => {
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
							const maskedPayload = message && fromBytes(message.get_masked_payload());

							try {
								const channelData: ChannelData = {
									link,
									channelLog: JSON.parse(maskedPayload)
								};
								return channelData;
							} catch (e) {
								this.logger.error('could not parse maskedPayload');
							}
						})
						.filter((c: ChannelData | undefined) => c);
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

			await subscriber.clone().receive_announcement(annAddress.copy());

			const response = await subscriber.clone().send_subscribe(annAddress.copy());
			const subscriptionLink = response.get_link();

			return { seed, subscriptionLink: subscriptionLink.to_string(), subscriber: subscriber.clone(), publicKey: subscriber.clone().get_public_key() };
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not request the subscription to the channel');
		}
	};

	async receiveSubscribe(subscriptionLink: string, author: Author) {
		const subscriptionAddress = streams.Address.from_string(subscriptionLink);
		await author.clone().receive_subscribe(subscriptionAddress);
	}

	authorizeSubscription = async (
		anchorLink: string,
		publicKeys: string[],
		author: Author
	): Promise<{ keyloadLink: string; sequenceLink: string; author: Author }> => {
		try {
			const anchorAddress = streams.Address.from_string(anchorLink);

			const keys = streams.PublicKeys.new();
			publicKeys.forEach((publicKey) => {
				keys.add(publicKey);
			});

			const ids = streams.PskIds.new();
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
	};

	makeSeed(size: number) {
		const alphabet = 'abcdefghijklmnopqrstuvwxyz';
		let seed = '';
		for (let i = 9; i < size; i++) {
			seed += alphabet[Math.floor(Math.random() * alphabet.length)];
		}
		return seed;
	}

	importSubscription = (state: string, isAuthor: boolean): Author | Subscriber => {
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
	};

	exportSubscription = (subscription: Author | Subscriber, password: string): string => {
		try {
			return fromBytes(subscription.clone().export(password));
		} catch (error) {
			this.logger.error(`Error from streams sdk: ${error}`);
			throw new Error('could not export the subscription object');
		}
	};

	private getClient(node: string): streams.Client {
		const options = new streams.SendOptions(node, true);
		return new streams.Client(node, options.clone());
	}
}
