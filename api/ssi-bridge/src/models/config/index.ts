import * as Identity from '@iota/identity-wasm/node';

export interface Config {
	port: number;
	apiVersion: string;
	databaseUrl: string;
	databaseName: string;
	identityConfig: IdentityConfig;
	serverSecret: string;
	jwtSecret: string;
	apiKey: string | undefined;
	hornetNode: string;
	permaNode: string;
	jwtExpiration: string;
	commitHash: string;
}

export interface IdentityConfig {
	keyCollectionSize: number; // size must be a multiple of 2^2, 2^3, 2^4, ...
	node: string;
	permaNode: string;
	keyType: Identity.KeyType;
	hashFunction: number; // TODO remove
	keyCollectionTag: string;
	hashEncoding: 'base16' | 'base58' | 'base64';
}
