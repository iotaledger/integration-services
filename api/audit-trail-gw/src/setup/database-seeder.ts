import { CollectionNames } from '../database/constants';
import { ILogger, MongoDbService } from '@iota/is-shared-modules';

const LOCK_EXPIRATION_TIME_SEC = 55;

export interface IDatabaseSeeder {
	seed(): void;
}

export class DatabaseSeeder {
	constructor(private readonly logger: ILogger) {}
	async seed() {
		const db = MongoDbService.db;
		const concurrencyCollection = db.collection(CollectionNames.concurrencyLocks);
		await concurrencyCollection.createIndex({ created: 1 }, { expireAfterSeconds: LOCK_EXPIRATION_TIME_SEC });

		const channelCollection = db.collection(CollectionNames.channelInfo);
		await channelCollection.createIndex({ name: 1 }, { unique: true, partialFilterExpression: { name: { $exists: true } } });

		this.logger.log('Database successfully seeded.');
	}
}
