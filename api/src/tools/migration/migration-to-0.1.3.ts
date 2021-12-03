import * as dotenv from 'dotenv';
dotenv.config();
import { MongoDbService } from '../../services/mongodb-service';

const migrate = async () => {
	console.log('starting migration...');

	const config = {
		databaseUrl: process.env.DATABASE_URL,
		databaseName: process.env.DATABASE_NAME
	};

	await MongoDbService.connect(config.databaseUrl, config.databaseName);
	const db = MongoDbService.db;

	await db.collection('users').updateMany({}, [{ $set: { id: '$identityId' } }]);
	await db.collection('trusted-roots').updateMany({}, [{ $set: { id: '$identityId' } }]);
	await db.collection('subscriptions').updateMany({}, [{ $set: { id: '$identityId' } }]);
	await db.collection('channel-data').updateMany({}, [{ $set: { id: '$identityId' } }]);

	await MongoDbService.disconnect();
	console.log('migration done!');
};

migrate();
