import { Config } from '../models/config';
import { IdentityConfig } from '../models/config/index';
import * as Identity from '@iota/identity-wasm/node';
import isEmpty from 'lodash/isEmpty';
import { getServerIdentities } from '../database/user';
import { ILogger } from '../utils/logger/index';
import { getIdentityKeys } from '../database/identity-keys';

const VERSION = 'v0.1';

export interface IConfigurationService {
	serverIdentityId: string;
	config: Config;
	identityConfig: IdentityConfig;
	getRootIdentityId(): Promise<string>;
}

export class ConfigurationService {
	static instance: ConfigurationService;
	logger: ILogger;
	private _serverIdentityId: string;

	identityConfig: IdentityConfig = {
		keyCollectionSize: 4096, // size must be a multiple of 2^2, 2^3, 2^4, ...
		node: process.env.IOTA_HORNET_NODE,
		permaNode: process.env.IOTA_PERMA_NODE,
		keyType: Identity.KeyType.Ed25519,
		hashFunction: Identity.Digest.Sha256,
		hashEncoding: 'base58',
		keyCollectionTag: 'key-collection'
	};

	config: Config = {
		port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
		apiVersion: VERSION,
		databaseUrl: process.env.DATABASE_URL,
		databaseName: process.env.DATABASE_NAME,
		serverSecret: process.env.SERVER_SECRET,
		jwtSecret: process.env.JWT_SECRET,
		hornetNode: process.env.IOTA_HORNET_NODE,
		permaNode: process.env.IOTA_PERMA_NODE,
		apiKey: process.env.API_KEY,
		commitHash: process.env.COMMIT_HASH,
		identityConfig: this.identityConfig,
		jwtExpiration: !isEmpty(process.env.JWT_EXPIRATION) ? process.env.JWT_EXPIRATION : '1 day'
	};

	constructor(logger: ILogger) {
		this.logger = logger;
		this.assertConfig();
	}

	public static getInstance(logger: ILogger): ConfigurationService {
		if (!ConfigurationService.instance) {
			ConfigurationService.instance = new ConfigurationService(logger);
		}
		return ConfigurationService.instance;
	}

	public get serverIdentityId(): string {
		return this._serverIdentityId;
	}

	public set serverIdentityId(value: string) {
		this._serverIdentityId = value;
	}

	async getRootIdentityId(): Promise<string> {
		try {
			const rootServerIdentities = await getServerIdentities();

			if (!rootServerIdentities || rootServerIdentities.length == 0) {
				this.logger.error('No root identity found!');
				return null;
			}

			if (rootServerIdentities.length > 1) {
				this.logger.error(`Database is in bad state: found ${rootServerIdentities.length} root identities`);
				return null;
			}

			const rootServerIdentity = rootServerIdentities[0];
			const serverIdentityId = rootServerIdentity?.id;

			if (!serverIdentityId) {
				this.logger.error('Root identity id not found');
				return null;
			}

			// check if there is a valid identity-doc
			const serverIdentity = await getIdentityKeys(serverIdentityId, this.config.serverSecret);

			if (!serverIdentity) {
				this.logger.error(`Root identity document with id: ${serverIdentityId} not found in database!`);
				return null;
			}

			this.serverIdentityId = serverIdentityId;
			this.logger.log('Found server identity id: ' + serverIdentityId);
			return serverIdentityId;
		} catch (e) {
			this.logger.error('Error:' + e);
		}

		return null;
	}

	private assertConfig() {
		const config = this.config;

		try {
			if (config?.serverSecret === '<server-secret>') {
				throw Error('Please replace the default SERVER_SECRET!');
			}
			if (config?.jwtSecret === '<jwt-secret>') {
				throw Error('Please replace the default JWT_SECRET!');
			}
			if (config?.apiKey === '<optional-api-key>') {
				throw Error('Please replace the default API_KEY or delete it!');
			}
			if (config?.commitHash === '<optional-commit-hash>') {
				throw Error('Please replace the default COMMIT_HASH or delete it!');
			}

			if (config?.serverSecret?.length !== 32 || config?.jwtSecret?.length !== 32) {
				throw Error('SERVER_SECRET and JWT_SECRET must have a length of 32!');
			}

			// apiKey can be empty if the host decides so
			// commitHash is set automatically during deployment
			const optionalEnvVariables = ['apiKey', 'commitHash'];
			Object.values(config).map((value, i) => {
				if (isEmpty(value) && (isNaN(value) || value == null || value === '')) {
					if (optionalEnvVariables.includes(Object.keys(config)[i])) {
						return;
					}

					throw Error(`Env var is missing or invalid: ${Object.keys(config)[i]}`);
				}
			});
		} catch (e: any) {
			this.logger.error(e.message);
			process.exit(1);
		}
	}
}
