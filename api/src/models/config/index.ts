import * as Identity from '@iota/identity-wasm/node';

export interface Config {
	port: number;
	apiVersion: string;
	databaseUrl: string;
	databaseName: string;
	serverIdentityId: string;
	identityConfig: IdentityConfig;
	streamsConfig: StreamsConfig;
	serverSecret: string;
	apiKey: string | undefined;
	hornetNode: string;
	permaNode: string;
	jwtExpiration: string;
}

export interface IdentityConfig {
	network: string;
	node: string;
	permaNode: string;
	explorer: string;
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
