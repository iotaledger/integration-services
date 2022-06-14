import * as dotenv from 'dotenv';
dotenv.config();
import { MongoDbService } from '@iota/is-shared-modules';

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

	// since now only keys are stored this collection will be renamed!
	const collections = await db.listCollections().toArray();
	const collectionNames = collections.map((c: any) => c.name);
	if (collectionNames.some((n: string) => n === 'identity-docs') && !collectionNames.some((n: string) => n === 'identity-keys')) {
		await db.collection('identity-docs').rename('identity-keys');
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
				},
				{
					$unset: 'txHash'
				}
			]
		);
	}

	await MongoDbService.disconnect();
	console.log('migration done!');
};

migrate();
