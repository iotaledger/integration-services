import { Config, IdentityConfig, StreamsConfig } from '../models/config';
import isEmpty from 'lodash/isEmpty';
import * as Identity from '@iota/identity-wasm/node';
import { existsSync, readFileSync } from 'fs';

const StreamsConfig: StreamsConfig = {
	node: process.env.IOTA_HORNET_NODE,
	permaNode: process.env.IOTA_PERMA_NODE,
	statePassword: process.env.SERVER_SECRET
};

const IdentityConfig: IdentityConfig = {
	network: process.env.NETWORK,
	node: process.env.IOTA_HORNET_NODE,
	permaNode: process.env.IOTA_PERMA_NODE,
	explorer: process.env.EXPLORER,
	keyType: Identity.KeyType.Ed25519,
	hashFunction: Identity.Digest.Sha256,
	hashEncoding: 'base58',
	keyCollectionTag: 'key-collection'
};

export const CONFIG: Config = {
	port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
	apiVersion: process.env.API_VERSION,
	databaseUrl: process.env.DATABASE_URL,
	databaseName: process.env.DATABASE_NAME,
	serverIdentityFile: process.env.SERVER_IDENTITY_FILE,
	serverIdentityId: process.env.SERVER_IDENTITY,
	serverSecret: process.env.SERVER_SECRET,
	hornetNode: process.env.IOTA_HORNET_NODE,
	permaNode: process.env.IOTA_PERMA_NODE,
	apiKey: process.env.API_KEY,
	commitHash: process.env.COMMIT_HASH,
	identityConfig: IdentityConfig,
	streamsConfig: StreamsConfig,
	jwtExpiration: !isEmpty(process.env.JWT_EXPIRATION) ? process.env.JWT_EXPIRATION : '1 day'
};

const assertConfig = (config: Config) => {
	
	if (config.serverSecret === '<server-secret>' || config.serverIdentityId === '<server-identity>') {
		console.error('please replace the default values!');
	}

	if (config.serverSecret.length !== 32) {
		throw Error('Server secret must to have a length of 32!');
	}

	// apiKey can be empty if the host decides so
	// commitHash is set automatically during deployment
	const optionalEnvVariables = ['apiKey', 'commitHash'];
	Object.values(config).map((value, i) => {
		if (isEmpty(value) && (isNaN(value) || value == null || value === '')) {
			if (optionalEnvVariables.includes(Object.keys(config)[i])) {
				return;
			}

			console.error(`env var is missing or invalid: ${Object.keys(config)[i]}`);
		}
	});

	if (config.serverIdentityFile) {
		if (existsSync(config.serverIdentityFile)) {
			const rootIdentity = JSON.parse(readFileSync(config.serverIdentityFile).toString());
			if (!rootIdentity.root) {
				throw new Error('root field missing in the SERVER_IDENTITY_FILE file');
			}
			config.serverIdentityId = rootIdentity.root
		}
	}

};

assertConfig(CONFIG);
