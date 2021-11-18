import { Config } from '../models/config';
import { IdentityConfig, StreamsConfig } from '../models/config/index';
import * as Identity from '@iota/identity-wasm/node';
import isEmpty from 'lodash/isEmpty';

export class ConfigurationService {
	constructor() {}

	static async getConfiguration(): Promise<Config> {
		const streamsConfig: StreamsConfig = {
			node: process.env.IOTA_HORNET_NODE,
			permaNode: process.env.IOTA_PERMA_NODE,
			statePassword: process.env.SERVER_SECRET
		};

		const identityConfig: IdentityConfig = {
			network: process.env.NETWORK,
			node: process.env.IOTA_HORNET_NODE,
			permaNode: process.env.IOTA_PERMA_NODE,
			explorer: process.env.EXPLORER,
			keyType: Identity.KeyType.Ed25519,
			hashFunction: Identity.Digest.Sha256,
			hashEncoding: 'base58',
			keyCollectionTag: 'key-collection'
		};

		return {
			port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
			apiVersion: process.env.API_VERSION,
			databaseUrl: process.env.DATABASE_URL,
			databaseName: process.env.DATABASE_NAME,
			serverSecret: process.env.SERVER_SECRET,
			hornetNode: process.env.IOTA_HORNET_NODE,
			permaNode: process.env.IOTA_PERMA_NODE,
			apiKey: process.env.API_KEY,
			commitHash: process.env.COMMIT_HASH,
			identityConfig,
			streamsConfig,
			jwtExpiration: !isEmpty(process.env.JWT_EXPIRATION) ? process.env.JWT_EXPIRATION : '1 day',
			serverIdentity: '' // TODO this must be requested from db!
		};
	}
}
