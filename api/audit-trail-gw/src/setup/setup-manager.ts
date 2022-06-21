import { DatabaseSeeder } from './database-seeder';
import { Logger, MongoDbService } from '@iota/is-shared-modules';
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
