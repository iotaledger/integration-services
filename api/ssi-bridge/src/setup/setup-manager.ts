import { DatabaseSeeder } from './database-seeder';
import { KeyGenerator } from './key-generator';
import { Logger } from '../utils/logger/index';
import { MongoDbService } from '@iota-is/shared-modules/lib/services/mongodb-service';
import { ConfigurationService } from '../services/configuration-service';

export class SetupManager {
	async runSetup() {
		const logger = Logger.getInstance();
		const configService = ConfigurationService.getInstance(logger);
		const config = configService.config;

		await MongoDbService.connect(config.databaseUrl, config.databaseName);

		// seed the database with indexes
		const dbSeeder = new DatabaseSeeder(logger);
		await dbSeeder.seed();

		// create keys for root identity if not exists
		const keyGenerator = new KeyGenerator(configService, logger);
		await keyGenerator.keyGeneration();

		await MongoDbService.disconnect();
	}
}
