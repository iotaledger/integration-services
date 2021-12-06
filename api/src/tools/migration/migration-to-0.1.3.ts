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
	await db.collection('users').updateMany(
		{
			identityId: { $exists: true }
		},
		[{ $set: { id: '$identityId' } }, { $unset: 'identityId' }]
	);
	await db.collection('trusted-roots').updateMany(
		{
			identityId: { $exists: true }
		},
		[{ $set: { id: '$identityId' } }, { $unset: 'identityId' }]
	);
	await db.collection('subscriptions').updateMany(
		{
			identityId: { $exists: true }
		},
		[{ $set: { id: '$identityId' } }, { $unset: 'identityId' }]
	);
	await db.collection('channel-data').updateMany(
		{
			identityId: { $exists: true }
		},
		[{ $set: { id: '$identityId' } }, { $unset: 'identityId' }]
	);

	await MongoDbService.disconnect();
	console.log('migration done!');
};

migrate();
