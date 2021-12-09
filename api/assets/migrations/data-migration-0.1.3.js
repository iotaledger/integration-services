// You can also unset the migrated identityId after running this script.
// This can be done by replacing `$set: {...}` by: `$unset: "identityId"`

db.getCollection('users').update(
	// query
	{
		identityId: { $exists: true }
	},
	// update
	[
		{
			$set: {
				id: '$identityId'
			}
		},
		{ $unset: 'identityId' }
	],
	// options
	{
		multi: true, // update only one document
		upsert: false // insert a new document, if no existing document match the query
	}
);
db.getCollection('trusted-roots').update(
	// query
	{
		identityId: { $exists: true }
	},
	// update
	[
		{
			$set: {
				id: '$identityId'
			}
		},
		{ $unset: 'identityId' }
	],
	// options
	{
		multi: true, // update only one document
		upsert: false // insert a new document, if no existing document match the query
	}
);
db.getCollection('subscriptions').update(
	// query
	{
		identityId: { $exists: true }
	},
	// update
	[
		{
			$set: {
				id: '$identityId'
			}
		},
		{ $unset: 'identityId' }
	],
	// options
	{
		multi: true, // update only one document
		upsert: false // insert a new document, if no existing document match the query
	}
);
db.getCollection('channel-data').update(
	// query
	{
		identityId: { $exists: true }
	},
	// update
	[
		{
			$set: {
				id: '$identityId'
			}
		},
		{ $unset: 'identityId' }
	],
	// options
	{
		multi: true, // update only one document
		upsert: false // insert a new document, if no existing document match the query
	}
);
