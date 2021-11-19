import { Config } from '../models/config';
import { IdentityConfig, StreamsConfig } from '../models/config/index';
import * as Identity from '@iota/identity-wasm/node';
import isEmpty from 'lodash/isEmpty';
import { getServerIdentity } from '../database/user';
import { ILogger, Logger } from '../utils/logger/index';
import { getIdentity } from '../database/identity-docs';

export interface IConfigurationService {
	serverIdentityId: string;
	config: Config;
	identityConfig: IdentityConfig;
	streamsConfig: StreamsConfig;
	getRootIdentityId(): Promise<string>;
}

export class ConfigurationService {
	private static instance: ConfigurationService;
	logger: ILogger;
	private _serverIdentityId: string;
	streamsConfig: StreamsConfig = {
		node: process.env.IOTA_HORNET_NODE,
		permaNode: process.env.IOTA_PERMA_NODE,
		statePassword: process.env.SERVER_SECRET
	};

	identityConfig: IdentityConfig = {
		network: process.env.NETWORK,
		node: process.env.IOTA_HORNET_NODE,
		permaNode: process.env.IOTA_PERMA_NODE,
		explorer: process.env.EXPLORER,
		keyType: Identity.KeyType.Ed25519,
		hashFunction: Identity.Digest.Sha256,
		hashEncoding: 'base58',
		keyCollectionTag: 'key-collection'
	};

	config: Config = {
		port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
		apiVersion: process.env.API_VERSION,
		databaseUrl: process.env.DATABASE_URL,
		databaseName: process.env.DATABASE_NAME,
		serverSecret: process.env.SERVER_SECRET,
		hornetNode: process.env.IOTA_HORNET_NODE,
		permaNode: process.env.IOTA_PERMA_NODE,
		apiKey: process.env.API_KEY,
		commitHash: process.env.COMMIT_HASH,
		identityConfig: this.identityConfig,
		streamsConfig: this.streamsConfig,
		jwtExpiration: !isEmpty(process.env.JWT_EXPIRATION) ? process.env.JWT_EXPIRATION : '1 day'
	};

	constructor() {
		this.logger = Logger.getInstance();
	}

	public static getInstance(): ConfigurationService {
		if (!ConfigurationService.instance) {
			ConfigurationService.instance = new ConfigurationService();
		}
		return ConfigurationService.instance;
	}

	// Ensure that on the db there is the declared root identity
	// async checkRootIdentity(): Promise<IdentityJsonUpdate> {
	// 	ConfigurationService.instance.logger.log(`Checking root identity...`);

	// 	const rootServerIdentities = await getServerIdentity();
	// 	if (!rootServerIdentities || rootServerIdentities.length == 0) {
	// 		this.logger.error('Root identity is missing');
	// 		return null;
	// 	}

	// 	if (rootServerIdentities.length > 1) {
	// 		this.logger.error(`Database is in bad state: found ${rootServerIdentities.length} root identities`);
	// 		return null;
	// 	}

	// 	const rootServerIdentity = rootServerIdentities[0];
	// 	const serverIdentityId = rootServerIdentity?.identityId;

	// 	// TODO set config
	// 	// SERVER_IDENTITY.serverIdentity = serverIdentityId;
	// 	this.config.serverIdentity = serverIdentityId;
	// 	const serverIdentity = getIdentity(serverIdentityId, this.config.serverSecret);

	// if (!serverIdentity) {
	// 	throw Error('Root identity not found in database: ' + serverIdentityId);
	// }

	// 	return serverIdentity;
	// }

	public get serverIdentityId(): string {
		return this._serverIdentityId;
	}

	public set serverIdentityId(value: string) {
		this._serverIdentityId = value;
	}

	async getRootIdentityId(): Promise<string> {
		try {
			const rootServerIdentities = await getServerIdentity();

			if (!rootServerIdentities || rootServerIdentities.length == 0) {
				this.logger.error('Root identity is missing');
				return null;
			}

			if (rootServerIdentities.length > 1) {
				this.logger.error(`Database is in bad state: found ${rootServerIdentities.length} root identities`);
				return null;
			}

			const rootServerIdentity = rootServerIdentities[0];
			const serverIdentityId = rootServerIdentity?.identityId;

			if (!serverIdentityId) {
				this.logger.error('Server Identity ID not found');
				return null;
			}

			// check if there is a valid identity-doc
			const serverIdentity = getIdentity(serverIdentityId, this.config.serverSecret);
			if (!serverIdentity) {
				this.logger.error(`Root identity document not found in database: ${serverIdentityId}`);
			}

			this.serverIdentityId = serverIdentityId;
			this.logger.log('Found server ID: ' + serverIdentityId);
			return serverIdentityId;
		} catch (e) {
			this.logger.error('Error:' + e);
		}

		return null;
	}
}
