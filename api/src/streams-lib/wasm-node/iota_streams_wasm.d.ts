/* tslint:disable */
/* eslint-disable */
/**
*/
export function set_panic_hook(): void;
/**
*/
export class Address {
  free(): void;
/**
*/
  constructor();
/**
* @param {string} link
* @returns {Address}
*/
  static from_string(link: string): Address;
/**
* @returns {string}
*/
  to_string(): string;
/**
* @returns {Address}
*/
  copy(): Address;
/**
* @param {Address} addr
* @returns {boolean}
*/
  eq(addr: Address): boolean;
/**
* @returns {string}
*/
  addr_id: string;
/**
* @returns {string}
*/
  msg_id: string;
}
/**
*/
export class Author {
  free(): void;
/**
* @param {string} seed
* @param {SendOptions} options
* @param {boolean} multi_branching
*/
  constructor(seed: string, options: SendOptions, multi_branching: boolean);
/**
* @param {Client} client
* @param {string} seed
* @param {boolean} multi_branching
* @returns {Author}
*/
  static from_client(client: Client, seed: string, multi_branching: boolean): Author;
/**
* @param {Client} client
* @param {Uint8Array} bytes
* @param {string} password
* @returns {Author}
*/
  static import(client: Client, bytes: Uint8Array, password: string): Author;
/**
* @param {string} password
* @returns {Uint8Array}
*/
  export(password: string): Uint8Array;
/**
* @returns {Author}
*/
  clone(): Author;
/**
* @returns {string}
*/
  channel_address(): string;
/**
* @returns {boolean}
*/
  is_multi_branching(): boolean;
/**
* @returns {string}
*/
  get_public_key(): string;
/**
* @returns {any}
*/
  send_announce(): any;
/**
* @param {Address} link
* @returns {any}
*/
  send_keyload_for_everyone(link: Address): any;
/**
* @param {Address} link
* @param {PskIds} psk_ids
* @param {PublicKeys} sig_pks
* @returns {any}
*/
  send_keyload(link: Address, psk_ids: PskIds, sig_pks: PublicKeys): any;
/**
* @param {Address} link
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {any}
*/
  send_tagged_packet(link: Address, public_payload: Uint8Array, masked_payload: Uint8Array): any;
/**
* @param {Address} link
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {any}
*/
  send_signed_packet(link: Address, public_payload: Uint8Array, masked_payload: Uint8Array): any;
/**
* @param {Address} link_to
* @returns {any}
*/
  receive_subscribe(link_to: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_tagged_packet(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_signed_packet(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_sequence(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_msg(link: Address): any;
/**
* @returns {any}
*/
  sync_state(): any;
/**
* @returns {any}
*/
  fetch_next_msgs(): any;
/**
* @returns {any}
*/
  gen_next_msg_ids(): any;
}
/**
*/
export class Client {
  free(): void;
/**
* @param {string} node
* @param {SendOptions} options
*/
  constructor(node: string, options: SendOptions);
}
/**
*/
export class Message {
  free(): void;
/**
* @returns {Message}
*/
  static default(): Message;
/**
* @param {string | undefined} pk
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {Message}
*/
  static new(pk: string | undefined, public_payload: Uint8Array, masked_payload: Uint8Array): Message;
/**
* @returns {string}
*/
  get_pk(): string;
/**
* @returns {Array<any>}
*/
  get_public_payload(): Array<any>;
/**
* @returns {Array<any>}
*/
  get_masked_payload(): Array<any>;
}
/**
*/
export class NextMsgId {
  free(): void;
/**
* @param {string} pk
* @param {Address} msgid
* @returns {NextMsgId}
*/
  static new(pk: string, msgid: Address): NextMsgId;
/**
* @returns {string}
*/
  get_pk(): string;
/**
* @returns {Address}
*/
  get_link(): Address;
}
/**
*/
export class PskIds {
  free(): void;
/**
* @returns {PskIds}
*/
  static new(): PskIds;
/**
* @param {string} id
*/
  add(id: string): void;
/**
* @returns {Array<any>}
*/
  get_ids(): Array<any>;
}
/**
*/
export class PublicKeys {
  free(): void;
/**
* @returns {PublicKeys}
*/
  static new(): PublicKeys;
/**
* @param {string} id
*/
  add(id: string): void;
/**
* @returns {Array<any>}
*/
  get_pks(): Array<any>;
}
/**
*/
export class SendOptions {
  free(): void;
/**
* @param {string} url
* @param {number} depth
* @param {boolean} local_pow
* @param {number} threads
*/
  constructor(url: string, depth: number, local_pow: boolean, threads: number);
/**
* @returns {SendOptions}
*/
  clone(): SendOptions;
/**
* @returns {number}
*/
  depth: number;
/**
* @returns {boolean}
*/
  local_pow: boolean;
/**
* @returns {number}
*/
  threads: number;
/**
* @returns {string}
*/
  url: string;
}
/**
*/
export class Subscriber {
  free(): void;
/**
* @param {string} seed
* @param {SendOptions} options
*/
  constructor(seed: string, options: SendOptions);
/**
* @param {Client} client
* @param {string} seed
* @returns {Subscriber}
*/
  static from_client(client: Client, seed: string): Subscriber;
/**
* @param {Client} client
* @param {Uint8Array} bytes
* @param {string} password
* @returns {Subscriber}
*/
  static import(client: Client, bytes: Uint8Array, password: string): Subscriber;
/**
* @returns {Subscriber}
*/
  clone(): Subscriber;
/**
* @returns {string}
*/
  channel_address(): string;
/**
* @returns {boolean}
*/
  is_multi_branching(): boolean;
/**
* @returns {string}
*/
  get_public_key(): string;
/**
* @returns {boolean}
*/
  is_registered(): boolean;
/**
*/
  unregister(): void;
/**
* @param {string} password
* @returns {Uint8Array}
*/
  export(password: string): Uint8Array;
/**
* @param {Address} link
* @returns {any}
*/
  receive_announcement(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_keyload(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_tagged_packet(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_signed_packet(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_sequence(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_msg(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  send_subscribe(link: Address): any;
/**
* @param {Address} link
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {any}
*/
  send_tagged_packet(link: Address, public_payload: Uint8Array, masked_payload: Uint8Array): any;
/**
* @param {Address} link
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {any}
*/
  send_signed_packet(link: Address, public_payload: Uint8Array, masked_payload: Uint8Array): any;
/**
* @returns {any}
*/
  sync_state(): any;
/**
* @returns {any}
*/
  fetch_next_msgs(): any;
}
/**
*/
export class UserResponse {
  free(): void;
/**
* @param {Address} link
* @param {Address | undefined} seq_link
* @param {Message | undefined} message
* @returns {UserResponse}
*/
  static new(link: Address, seq_link?: Address, message?: Message): UserResponse;
/**
* @param {string} link
* @param {string | undefined} seq_link
* @param {Message | undefined} message
* @returns {UserResponse}
*/
  static from_strings(link: string, seq_link?: string, message?: Message): UserResponse;
/**
* @returns {UserResponse}
*/
  copy(): UserResponse;
/**
* @returns {Address}
*/
  get_link(): Address;
/**
* @returns {Address}
*/
  get_seq_link(): Address;
/**
* @returns {Message}
*/
  get_message(): Message;
}
