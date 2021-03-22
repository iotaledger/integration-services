import * as Identity from '@iota/identity-wasm/node';

export interface Config {
	port: number;
	apiVersion: string;
	databaseUrl: string;
	databaseName: string;
	serverIdentityId: string;
	identityConfig: IdentityConfig;
	serverSecret: string;
}

export interface IdentityConfig {
	network: string;
	node: string;
	explorer: string;
	keyType: Identity.KeyType;
	hashFunction: Identity.Digest;
	keyCollectionTag: string;
	hashEncoding: 'base16' | 'base58' | 'base64';
}
