// Before running this script in Robo3T copy the `identity-docs` collection and name it `identity-keys`

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
		multi: true, // update several documents
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
		multi: true, // update several documents
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
		multi: true, // update several documents
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
		multi: true, // update several documents
		upsert: false // insert a new document, if no existing document match the query
	}
);

db.getCollection('identity-keys').update(
	// query
	{
		doc: { $exists: true }
	},
	// update
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
	],
	// options
	{
		multi: true, // update several documents
		upsert: false // insert a new document, if no existing document match the query
	}
);
