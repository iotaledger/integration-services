import { ChannelData, ChannelLog } from '../models/types/channel-data';
import streams, { Address, Author, Subscriber } from '../streams-lib/wasm-node/iota_streams_wasm';
import { fromBytes, toBytes } from '../utils/text';
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

	create = async (seed?: string): Promise<{ seed: string; channelAddress: string; author: Author }> => {
		try {
			if (!seed) {
				seed = this.makeSeed(81);
			}
			const client = this.getClient(this.config.node);
			const author = streams.Author.from_client(client, seed, streams.ChannelType.MultiBranch);
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

	runExample = async () => {
		// Generate a unique seed for the author
		const seed = this.makeSeed(81);
		// Create the Transport Client
		let client = this.getClient(this.config.node);
		// Generate an Author

		const author = streams.Author.from_client(client, seed, streams.ChannelType.MultiBranch);
		// Create the channel with an announcement message. Make sure to save the resulting link somewhere,
		const response = await author.clone().send_announce();
		const ann_link = response.get_link();
		// This link acts as a root for the channel itself
		let ann_link_string = ann_link.to_string();
		console.log(`Announcement Link: ${ann_link_string}\nTangle Index: ${JSON.stringify(ann_link)}\n`);

		// ------------------------------------------------------------------
		// In their own separate instances generate the subscriber(s) that will be attaching to the channel
		client = this.getClient(this.config.node);
		const subscriber_a = streams.Subscriber.from_client(client, 'SubscriberA');

		client = this.getClient(this.config.node);
		const subscriber_b = streams.Subscriber.from_client(client, 'SubscriberB');

		// Generate an Address object from the provided announcement link string from the Author
		let ann_address = Address.from_string(ann_link_string);

		// Receive the announcement message to start listening to the channel
		await subscriber_a.clone().receive_announcement(ann_address.copy());
		await subscriber_b.clone().receive_announcement(ann_address.copy());

		// Subscribers send subscription messages linked to announcement message
		let subscribe_msg_a = (await subscriber_a.clone().send_subscribe(ann_address.copy())).get_link(); // TODO check if get_link should be used or not!
		let subscribe_msg_b = (await subscriber_b.clone().send_subscribe(ann_address.copy())).get_link();

		// These are the subscription links that should be provided to the Author to complete subscription
		let sub_msg_a_str = subscribe_msg_a.to_string();
		let sub_msg_b_str = subscribe_msg_b.to_string();
		console.log(`Subscription msgs:\n\tSubscriber A: ${sub_msg_a_str}\n\tTangle Index: ${JSON.stringify(subscribe_msg_a)}\n`);
		console.log(`\tSubscriber B: ${sub_msg_b_str}\n\tTangle Index: ${JSON.stringify(subscribe_msg_b)}\n`);

		// Fetch subscriber public keys (for use by author in issuing a keyload)
		let sub_a_pk = subscriber_a.clone().get_public_key();
		let sub_b_pk = subscriber_b.clone().get_public_key();

		// ----------------------------------------------------------------------
		// Get Address object from subscription message link provided by Subscriber A
		let sub_a_address = Address.from_string(sub_msg_a_str);

		// Get Address object from subscription message link provided by SubscriberB
		let sub_b_address = Address.from_string(sub_msg_b_str);

		// Author processes subscription messages
		await author.clone().receive_subscribe(sub_a_address.copy());
		await author.clone().receive_subscribe(sub_b_address.copy());

		// Expectant users are now ready to be included in Keyload messages

		// Author sends keyload with the public key of Sub A (linked to announcement message) to generate
		// a new branch. This will return a tuple containing the message links. The first is the message
		// link itself, the second is a sequencing message.
		const keys_a = streams.PublicKeys.new();
		keys_a.add(sub_a_pk);
		let ids = streams.PskIds.new();
		const res = await author.clone().send_keyload(ann_address.copy(), ids, keys_a);
		const keyloadLink_a = res?.get_link()?.to_string();
		const sequenceLink_a = res?.get_seq_link()?.to_string();
		console.log(`\nSent Keyload for Sub A: ${keyloadLink_a}, seq: ${sequenceLink_a}`);

		// Author will send the second Keyload with the public key of Subscriber B (also linked to the
		// announcement message) to generate another new branch
		// link itself, the second is a sequencing message.

		const keys_b = streams.PublicKeys.new();
		keys_b.add(sub_b_pk);
		ids = streams.PskIds.new();
		const res_b = await author.clone().send_keyload(ann_address.copy(), ids, keys_b);
		const keyloadLink_b = res_b?.get_link()?.to_string();
		const sequenceLink_b = res_b?.get_seq_link()?.to_string();
		console.log(`\nSent Keyload for Sub B: ${keyloadLink_b}, seq: ${sequenceLink_b}`);

		// Before sending any messages, a publisher in a multi publisher channel should sync their state
		// to ensure they are up to date
		await subscriber_a.clone().sync_state();
		await subscriber_b.clone().sync_state();

		// Subscriber A will now send signed encrypted messages in a chain attached to Keyload A
		let prev_msg_link = keyloadLink_a;
		const message = 'very basic message';
		let latestAddress = Address.from_string(prev_msg_link);
		const res_signed_package_a = await subscriber_a.clone().send_signed_packet(latestAddress, toBytes(''), toBytes(message));
		const msg_link = res_signed_package_a.get_link();
		const seq_link = res_signed_package_a.get_seq_link();
		console.log(`Sent msg from Sub A: ${msg_link}, seq: ${seq_link}`);
		prev_msg_link = msg_link;

		// Subscriber B will now send signed encrypted messages in a chain attached to Keyload B
		prev_msg_link = keyloadLink_b;
		latestAddress = Address.from_string(prev_msg_link);
		const res_signed_package_b = await subscriber_b.clone().send_signed_packet(latestAddress, toBytes(''), toBytes(message));
		const msg_link_b = res_signed_package_b.get_link();
		const seq_link_b = res_signed_package_b.get_seq_link();
		console.log(`Sent msg from Sub A: ${msg_link_b}, seq: ${seq_link_b}`);

		// -----------------------------------------------------------------------------
		// Author can now fetch these messages
		let retrieved = await author.clone().fetch_next_msgs();
		console.log('retrieved message ', JSON.stringify(retrieved));

		//  console.log("\nFound {} msgs", retrieved.len());
		//  let (retrieveda, retrievedb, retrievedc) = split_retrieved(&mut retrieved, pks);
		//  console.log("\nVerifying message retrieval: Author");
		//  verify_messages(&msg_inputs_a, retrieveda);
		//  verify_messages(&msg_inputs_b, retrievedb);
		//  verify_messages(&msg_inputs_c, retrievedc);
	};

	addLogs = async (
		latestLink: string,
		subscription: Author | Subscriber,
		channelLog: ChannelLog
	): Promise<{ link: string; subscription: Author | Subscriber; prevLogs: ChannelData[] | undefined }> => {
		try {
			// fetch prev logs before writing new data to the channel
			this.logger.log('latest link: ' + latestLink);
			// const prevLogs = await this.getLogs(subscription.clone());
			// this.logger.log('prevlos latest link: ' + prevLogs?.latestLink);
			this.logger.log('heeey2');
			let link = latestLink;
			// if (prevLogs?.latestLink) {
			// 	link = prevLogs.latestLink;
			// }
			const latestAddress = Address.from_string(link);
			const mPayload = toBytes(JSON.stringify(channelLog));

			let response: any = null;

			this.logger.log('heeey syyyync');
			await subscription.clone().sync_state();
			this.logger.log('heeey synced');
			response = await subscription.clone().send_signed_packet(latestAddress, toBytes(''), mPayload);
			const tag_link = response.get_link();

			return {
				link: tag_link.to_string(),
				prevLogs: null,
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
							const maskedPayload = message && fromBytes(message.get_masked_payload());
							console.log('MASKED PAYLOAD', maskedPayload);

							try {
								const channelData: ChannelData = {
									link,
									channelLog: JSON.parse(maskedPayload)
								};
								return channelData;
							} catch (e) {
								this.logger.error('could not parse maskedPayload');
								return;
							}
						})
						.filter((c: ChannelData | undefined) => c);
					channelData = [...channelData, ...cData];
				}
			}

			console.log('LATEST link', latestLink);

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
		publicKey: string,
		author: Author
	): Promise<{ keyloadLink: string; sequenceLink: string; author: Author }> => {
		try {
			const announcementAddress = streams.Address.from_string(channelAddress);
			const subscriptionAddress = streams.Address.from_string(subscriptionLink);
			await author.clone().receive_subscribe(subscriptionAddress);

			const keys = streams.PublicKeys.new();
			keys.add(publicKey);
			const ids = streams.PskIds.new();
			const res = await author.clone().send_keyload(announcementAddress, ids, keys);
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

	private getClient(node: string): streams.Client {
		const options = new streams.SendOptions(node, true);
		return new streams.Client(node, options.clone());
	}
}
// const config: StreamsConfig = {
// 	node: 'https://chrysalis-nodes.iota.org',
// 	permaNode: 'https://chrysalis-nodes.iota.org',
// 	statePassword: 'test123'
// };
// new StreamsService(config, Logger.getInstance()).runExample();
