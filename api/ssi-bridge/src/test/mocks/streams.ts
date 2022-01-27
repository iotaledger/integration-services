import { Author, Subscriber } from '@iota/streams/node/streams_wasm';

const sharedFunction = {
	sync_state: jest.fn(),
	export: jest.fn(),
	channel_address: jest.fn(),
	author_public_key: jest.fn(),
	fetch_next_msgs: jest.fn(),
	fetch_prev_msg: jest.fn(),
	fetch_prev_msgs: jest.fn(),
	fetch_state: jest.fn(),
	free: jest.fn(),
	get_client: jest.fn(),
	is_multi_branching: jest.fn(),
	is_registered: jest.fn(),
	receive_announcement: jest.fn(),
	receive_keyload: jest.fn(),
	receive_msg: jest.fn(),
	receive_msg_by_sequence_number: jest.fn(),
	receive_sequence: jest.fn(),
	receive_signed_packet: jest.fn(),
	receive_tagged_packet: jest.fn(),
	remove_psk: jest.fn(),
	reset_state: jest.fn(),
	send_signed_packet: jest.fn(),
	send_tagged_packet: jest.fn(),
	store_psk: jest.fn(),
	unregister: jest.fn()
};

const authorFunctions = {
	gen_next_msg_ids: jest.fn(),
	receive_subscribe: jest.fn(),
	receive_unsubscribe: jest.fn(),
	remove_subscriber: jest.fn(),
	send_announce: jest.fn(),
	send_keyload: jest.fn(),
	send_keyload_for_everyone: jest.fn(),
	store_new_subscriber: jest.fn(),
	channel_address: jest.fn(),
	export: jest.fn(),
	fetch_next_msgs: jest.fn(),
	fetch_prev_msg: jest.fn(),
	fetch_prev_msgs: jest.fn(),
	fetch_state: jest.fn(),
	free: jest.fn(),
	get_client: jest.fn(),
	is_multi_branching: jest.fn(),
	receive_msg: jest.fn(),
	receive_msg_by_sequence_number: jest.fn(),
	receive_sequence: jest.fn(),
	receive_signed_packet: jest.fn(),
	receive_tagged_packet: jest.fn(),
	remove_psk: jest.fn(),
	reset_state: jest.fn(),
	send_signed_packet: jest.fn(),
	send_tagged_packet: jest.fn(),
	store_psk: jest.fn(),
	sync_state: jest.fn()
};

export const AuthorMock: Author = {
	...sharedFunction,
	...authorFunctions,
	clone: () => AuthorMock,
	get_public_key: () => 'test-author-public-key'
};

const subscriberFunction = {
	send_subscribe: jest.fn(),
	send_unsubscribe: jest.fn()
};

export const SubscriberMock: Subscriber = {
	...sharedFunction,
	...subscriberFunction,
	clone: () => SubscriberMock,
	get_public_key: () => 'test-subscriber-public-key'
};
