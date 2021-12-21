import { CollectionNames } from '../database/constants';
import { Db } from 'mongodb';
import { ILogger } from '../utils/logger/index';

export interface IDatabaseSeeder {
	seed(): void;
}

export class DatabaseSeeder {
	constructor(private readonly logger: ILogger) {}
	async seed(db: Db) {
		const expireAfterSeconds = 55;
		const concurrencyCollection = db.collection(CollectionNames.concurrencyLocks);

		const indexExists = await concurrencyCollection.indexExists('created_1');
		if (indexExists) {
			await concurrencyCollection.dropIndex('created_1');
		}
		await concurrencyCollection.createIndex({ created: 1 }, { expireAfterSeconds });
		this.logger.log('Database successfully seeded.');
	}
}
