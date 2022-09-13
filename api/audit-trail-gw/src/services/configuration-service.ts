import { Config } from '../models/config';
import { StreamsConfig } from '../models/config/index';
import isEmpty from 'lodash/isEmpty';
import { ILogger } from '@iota/is-shared-modules/node';

const VERSION = 'v0.1';

export interface IConfigurationService {
	serverIdentityId: string;
	config: Config;
	streamsConfig: StreamsConfig;
	getRootIdentityId(): Promise<string>;
}

export class ConfigurationService {
	private static instance: ConfigurationService;
	logger: ILogger;

	streamsConfig: StreamsConfig = {
		node: process.env.IOTA_HORNET_NODE,
		permaNode: process.env.IOTA_PERMA_NODE,
		statePassword: process.env.SERVER_SECRET
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
		ssiBridgeUrl: process.env.SSI_BRIDGLE_URL,
		ssiBridgeApiKey: process.env.SSI_BRIDGLE_API_KEY,
		streamsConfig: this.streamsConfig
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
			const optionalEnvVariables = ['apiKey', 'commitHash', 'ssiBridgeUrl', 'ssiBridgeApiKey'];
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
