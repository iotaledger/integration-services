const streams = require('../streams-lib/wasm-node/iota_streams_wasm');
const fetch = require('node-fetch');

streams.set_panic_hook();

global.fetch = fetch;
global.Headers = fetch.Headers;
global.Request = fetch.Request;
global.Response = fetch.Response;

const config = {
	node: 'https://chrysalis-nodes.iota.org:443',
	permaNode: 'https://chrysalis-nodes.iota.org',
	statePassword: 'test123'
};

const toBytes = (str) => {
	const bytes = new Uint8Array(str.length);
	for (let i = 0; i < str.length; ++i) {
		bytes[i] = str.charCodeAt(i);
	}
	return bytes;
};

const makeSeed = (size) => {
	const alphabet = 'abcdefghijklmnopqrstuvwxyz';
	let seed = '';
	for (let i = 9; i < size; i++) {
		seed += alphabet[Math.floor(Math.random() * alphabet.length)];
	}
	return seed;
};

const getClient = (node) => {
	const options = new streams.SendOptions(node, true);
	return new streams.Client(node, options.clone());
};

const runExample = async () => {
	try {
		// Generate a unique seed for the author
		const seed = makeSeed(81);
		// Create the Transport Client
		let client = getClient(config.node);

		// Generate an Author
		const author = streams.Author.from_client(client, seed, streams.ChannelType.MultiBranch);
		console.log('IS IT A MULTI BRANCH?', author.is_multi_branching());

		// Create the channel with an announcement message. Make sure to save the resulting link somewhere,
		const response = await author.clone().send_announce();
		const ann_link = response.get_link();

		// This link acts as a root for the channel itself
		let ann_link_string = ann_link.to_string();
		console.log(`Announcement Link: ${ann_link_string}\nTangle Index: ${JSON.stringify(ann_link)}\n`);

		// ------------------------------------------------------------------
		// In their own separate instances generate the subscriber(s) that will be attaching to the channel
		client = getClient(config.node);
		const subscriber_a = streams.Subscriber.from_client(client, 'SubscriberA');

		client = getClient(config.node);
		const subscriber_b = streams.Subscriber.from_client(client, 'SubscriberB');

		// Generate an Address object from the provided announcement link string from the Author
		let ann_address = streams.Address.from_string(ann_link_string);

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
		console.log('Public Key A', sub_a_pk);
		console.log('Public Key B', sub_b_pk);

		// ----------------------------------------------------------------------
		// Get Address object from subscription message link provided by Subscriber A
		let sub_a_address = streams.Address.from_string(sub_msg_a_str);

		// Get Address object from subscription message link provided by SubscriberB
		let sub_b_address = streams.Address.from_string(sub_msg_b_str);

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

		console.log('IS IT A MULTI BRANCH?', author.is_multi_branching());

		// Before sending any messages, a publisher in a multi publisher channel should sync their state
		// to ensure they are up to date
		await subscriber_a.clone().sync_state();
		await subscriber_b.clone().sync_state();

		// Subscriber A will now send signed encrypted messages in a chain attached to Keyload A
		let prev_msg_link = keyloadLink_a;
		const message = 'very basic message';
		let latestAddress = streams.Address.from_string(prev_msg_link);
		const res_signed_package_a = await subscriber_a.clone().send_signed_packet(latestAddress, toBytes(''), toBytes(message));
		const msg_link = res_signed_package_a.get_link();
		const seq_link = res_signed_package_a.get_seq_link();
		console.log(`Sent msg from Sub A: ${msg_link}, seq: ${seq_link}`);
		prev_msg_link = msg_link;

		// Subscriber B will now send signed encrypted messages in a chain attached to Keyload B
		prev_msg_link = keyloadLink_b;
		latestAddress = streams.Address.from_string(prev_msg_link);
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
	} catch (e) {
		console.log('error:', e);
	}
};

runExample();
