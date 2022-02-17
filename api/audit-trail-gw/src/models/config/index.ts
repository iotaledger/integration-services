import * as Identity from '@iota/identity-wasm/node';

export interface Config {
	port: number;
	apiVersion: string;
	databaseUrl: string;
	databaseName: string;
	identityConfig: IdentityConfig;
	streamsConfig: StreamsConfig;
	serverSecret: string;
	apiKey: string | undefined;
	hornetNode: string;
	permaNode: string;
	commitHash: string;
}

export interface IdentityConfig {
	keyCollectionSize: number; // size must be a multiple of 2^2, 2^3, 2^4, ...
	node: string;
	permaNode: string;
	keyType: Identity.KeyType;
	hashFunction: Identity.Digest;
	keyCollectionTag: string;
	hashEncoding: 'base16' | 'base58' | 'base64';
}

export interface StreamsConfig {
	statePassword: string;
	node: string;
	permaNode: string;
}
