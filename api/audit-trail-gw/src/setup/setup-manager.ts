import { DatabaseSeeder } from './database-seeder';
import { Logger } from '@iota/is-shared-modules/lib/utils/logger/index';
import { MongoDbService } from '@iota/is-shared-modules/lib/services/mongodb-service';
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

		await MongoDbService.disconnect();
	}
}
