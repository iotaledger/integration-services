import { Config, IdentityConfig, StreamsConfig } from '../models/config';
import isEmpty from 'lodash/isEmpty';
import * as Identity from '@iota/identity-wasm/node';

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
	serverIdentityId: process.env.SERVER_IDENTITY,
	serverSecret: process.env.SERVER_SECRET,
	hornetNode: process.env.IOTA_HORNET_NODE,
	permaNode: process.env.IOTA_PERMA_NODE,
	apiKey: process.env.API_KEY,
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

	Object.values(config).map((value, i) => {
		if (isEmpty(value) && (isNaN(value) || value == null || value === '')) {
			// apiKey can be empty if the host decides so
			if (Object.keys(config)[i] === 'apiKey') {
				return;
			}

			console.error(`env var is missing or invalid: ${Object.keys(config)[i]}`);
		}
	});
};

assertConfig(CONFIG);
