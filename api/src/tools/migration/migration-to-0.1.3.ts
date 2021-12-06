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

	// since only keys are stored this collection can be renamed!
	// TODO remove _copy
	const collections = await db.listCollections().toArray();
	const collectionNames = collections.map((c) => c.name);
	if (collectionNames.some((n) => n === 'identity-docs_copy') && !collectionNames.some((n) => n === 'identity-keys')) {
		await db.collection('identity-docs_copy').rename('identity-keys');
		await db.collection('identity-keys').updateMany(
			{
				doc: { $exists: true }
			},
			[
				{
					$set: {
						id: '$doc.id'
					}
				},
				{
					$unset: 'doc'
				}
			]
		);
	}

	await MongoDbService.disconnect();
	console.log('migration done!');
};

migrate();
