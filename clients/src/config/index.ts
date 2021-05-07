export const Config = {
	baseUrl: process.env.BASE_URL
};

export const users = [
	{
		_id: 'did:iota:6cTkp3gCV3yifiGDHUK4x1omXb6yFBTRg7NS2x3kBDUm',
		userId: 'did:iota:6cTkp3gCV3yifiGDHUK4x1omXb6yFBTRg7NS2x3kBDUm',
		publicKey: 'HmvXxyyzaA9B5CMp63xG9ptEkgwmHgaYVStdDsYxzDTX',
		username: 'test-device',
		type: 'device',
		subscribedChannelIds: ['test-address-c2', 'test-address'],
		description: 'Device which measures temperature in the kitchen.',
		organization: 'IOTA',
		registrationDate: { $date: '2021-03-15T09:29:56.732Z' }
	},
	{
		userId: 'did:iota:6cTkp3gCV3yifiGDHUK4x1omXb6yFBTRg7NS2x3kBDUm',
		username: 'second-user',
		firstName: 'Brandon',
		lastName: 'Tomson',
		organization: 'University Account',
		type: 'Person',
		description: 'Just a user from the university.',
		verification: {
			verified: true
		}
	}
];

// returned from localhost:3000/api/v1/authentication/create-identity
export const UserIdentity = {
	doc: {
		id: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
		authentication: [
			{
				id: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4#key',
				controller: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
				type: 'Ed25519VerificationKey2018',
				publicKeyBase58: '8WaGsr277JQaqV9fxHmFNGC9haApFbBfdnytmq5gq4vm'
			}
		],
		created: '2021-03-16T14:18:47Z',
		updated: '2021-03-16T14:18:47Z',
		immutable: false,
		proof: {
			type: 'JcsEd25519Signature2020',
			verificationMethod: '#key',
			signatureValue: '2AKaB7KC9rQQLirMgRoYYns6fF2wVtryCnqKesMiwxuhmYzYPtPBbc6jeMPxgMHWtSoQQKyPkVdcFKx87LPabAq1'
		}
	},
	userData: {
		userId: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
		publicKey: '8WaGsr277JQaqV9fxHmFNGC9haApFbBfdnytmq5gq4vm',
		username: 'first-user',
		type: 'Person',
		description: 'Just a user',
		registrationDate: '2021-03-16T14:18:49Z',
		verification: {
			verified: true,
			verificationDate: '2021-04-13T08:12:29Z',
			lastTimeChecked: '2021-04-13T08:12:29Z',
			verificationIssuerId: 'did:iota:HGz5ih7k7JkK9yCQTnR1vmuLs4vE7BNFCoigLuwCxwok'
		},
		organization: 'IOTA',
		verifiableCredentials: [
			{
				'@context': 'https://www.w3.org/2018/credentials/v1',
				id: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
				type: ['VerifiableCredential', 'PersonCredential'],
				credentialSubject: {
					id: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
					type: 'Person',
					initiatorId: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
					organization: 'IOTA',
					registrationDate: '2021-03-16T15:18:49+01:00',
					username: 'first-user'
				},
				issuer: 'did:iota:DYc6feyWBHC6ns9gA53HCNrFvdgUYWSjw7BQbw9vH4vA',
				issuanceDate: '2021-04-08T12:50:50Z',
				proof: {
					type: 'MerkleKeySignature2021',
					verificationMethod: '#key-collection',
					signatureValue:
						'5LHA1tXQvQVNv2f7KEE2C9aGqhEeET4SHo7owgQxaHEe.111Lcp5hAiyvWxmj4wSrDkfZgtazSFXotBGjTkwMSzZNgoX7iXNZSBLYFt4y1a3uMVue7fmTbmxQQQhn6Rm1aoxzhECnMeHX6YuJKroYuAJJCcDcWGgncw6euZfo3nDxN4RipgZdKrSMNWNG6zyhTFHqoMpMof28WBWc8M5wPrN3scabVUHhoXjGWjM8sfTzZeSS8F59kbD68rrTJJ4nXRJGvwL3tUk6CGeoA.44ufMTxw7UGhmYEVY3UoTF6dp3Hg4K8ZzrryDNQXoGzzXxhQwjh5zksH67DVJgXi8qCizCzvffrvhmhuHJmhnVkK'
				}
			},
			{
				'@context': 'https://www.w3.org/2018/credentials/v1',
				id: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
				type: ['VerifiableCredential', 'PersonCredential'],
				credentialSubject: {
					id: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
					type: 'Person',
					initiatorId: 'did:iota:DYc6feyWBHC6ns9gA53HCNrFvdgUYWSjw7BQbw9vH4vA',
					organization: 'IOTA',
					registrationDate: '2021-03-16T15:18:49+01:00',
					username: 'first-user'
				},
				issuer: 'did:iota:HGz5ih7k7JkK9yCQTnR1vmuLs4vE7BNFCoigLuwCxwok',
				issuanceDate: '2021-04-13T08:12:29Z',
				proof: {
					type: 'MerkleKeySignature2021',
					verificationMethod: '#key-collection',
					signatureValue:
						'3iugc5oM8bEGF5bk8yj6jKtd5cvV7S7kMxcTr65UUmSb.1113qJLdpQDayzHtzPK9LHZ8PQDhGcnRr7xLSyUz3ySsgWHQRx1SUePTvxXqjzeXgJFDdQsBCWUPoBGJDQeTJJFg5Khbrqx2Ton5Z6mrehJT4gfEffv1h5BHqB9GPJTKE5oivARox1L4UM4sy1TwVtxZUSABH8LgnaCjQAcQJRos9NWzL1wwkSwhNPje1GVfKuqJSS1f1nsQVQspuVSgxWiqriy7ppe3ErbNVDzn6acG7mdatDtyCAwWVHHtBQUgSLhkqLhyHqFzC8WTiskYVnY2kVEEmiq4hy66ov6iVEukxoHoiEna6KZu46UoSUSaJSBj2EJvvvjPKqndW3BuxnVs46FVnJem3HihovbjMNn1XBg63bhVTWJfpXQ54YKBBdGA8qavhNfmAeqSdCxCJM7kjgH2gKXqG8TsiM8T25GW2tFs4HVVcypgrWFvq8SSV4FoPE7.52aMZLZSEJh1BCnSksJY1XYxQWyVyJSt8mzQ73om8ieMA4jqj1Y3PzPx1LJkCLhEZiQJyVbppy2RmLZeGLs14XDb'
				}
			}
		]
	},
	key: {
		type: 'ed25519',
		public: '8WaGsr277JQaqV9fxHmFNGC9haApFbBfdnytmq5gq4vm',
		secret: 'DadU1UNQfhTJrBHvYaML8wnxvJUEBsx7DtUvXSti5Mp8'
	},
	txHash: 'OGNVRNPA9LQKPEUQJEECRZRVMRAQA99RVTVUPIYQQGYVVFYBDRIHZGFVQQVKQHAPVGCZKMGUTZXAZ9999'
};

export const ServerIdentity = {
	_id: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
	doc: {
		id: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
		verificationMethod: [
			{
				id: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ#key-collection',
				controller: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
				type: 'MerkleKeyCollection2021',
				publicKeyBase58: '116Bo8Pfvanc2WNYLkYH4GdEk6hdZuFKA1razmkBqoBPzY'
			}
		],
		authentication: [
			{
				id: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ#key',
				controller: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
				type: 'Ed25519VerificationKey2018',
				publicKeyBase58: '5r7cbQkEXi2srrNUrVDkB79NnPuiBguWsPDvS6nY7yEb'
			}
		],
		created: '2021-03-24T14:38:41Z',
		updated: '2021-03-24T14:38:41Z',
		immutable: false,
		previous_message_id: 'ANZAUTTZHLIJADRODGCTESKILHXCIVMZHSYDWYINODE9OMUDV9CWPPUFMDAURXUNJASFNBWPRSPOZ9999',
		proof: {
			type: 'JcsEd25519Signature2020',
			verificationMethod: '#key',
			signatureValue: 'mCKHiqnAUaipR8rBc5skPuGRvo5xAj8PkByXnaKrznwmMMcVYQhcA6Zwdjkj7EHpMgTsZhXKPRPAbChTfz14qy5'
		}
	},
	userData: {
		userId: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
		publicKey: '5r7cbQkEXi2srrNUrVDkB79NnPuiBguWsPDvS6nY7yEb',
		username: 'api-identity',
		type: 'api',
		description: 'Root identity of the api!',
		registrationDate: '2021-03-24T14:38:43Z',
		verification: {
			verified: false,
			verificationDate: '2021-03-24T14:38:46Z',
			lastTimeChecked: '2021-04-08T08:39:25Z',
			verificationIssuerId: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ'
		},
		organization: 'IOTA',
		verifiableCredentials: [
			{
				'@context': 'https://www.w3.org/2018/credentials/v1',
				id: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
				type: ['VerifiableCredential', 'ApiCredential'],
				credentialSubject: {
					id: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
					type: 'api',
					organization: 'IOTA',
					registrationDate: '2021-03-24T15:38:43+01:00',
					username: 'api-identity'
				},
				issuer: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
				issuanceDate: '2021-03-24T14:38:45Z',
				proof: {
					type: 'MerkleKeySignature2021',
					verificationMethod: '#key-collection',
					signatureValue:
						'8rVDt6KCPoZVhMCGG5AQLZaUjFJ5LLv4iXsaoQjeqQpq.1117uJFpmAB6msQ9GdsSRvxfdSvfTas94EippDqh6foKFTY1diqiCzfAuqYVExhxeJGBYycQiDbxwGev9Chrtz51UYVbwUL1DR8gipj3zuZa4X2SF7UnTbAw74Dv3o2qsqi2FsxtssV.52yNV25JkS9sRw2tSCKw4yQ3hY4fEneEpk82vU9UX2G5vGJsPhvpjSwfX2cxvqJ48E8EvwDCXrFuetyLPLVQ1UGY'
				}
			}
		],
		role: 'admin'
	},
	key: { type: 'ed25519', public: '5r7cbQkEXi2srrNUrVDkB79NnPuiBguWsPDvS6nY7yEb', secret: '6rK7CLKdDw9kBYLQhH4A11vpeS1Hw9jvZagrqgtGcGEp' },
	encoding: 'base58',
	txHash: 'LCHPWELIWGXUSHX9YACHICTLRHVGTFHXBEQILQBCCTDDRLJTBLYHTGRT9HKOLQZQHENEHPEGYMZD99999'
};

export const DeviceIdentity = {
	doc: {
		id: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu',
		authentication: [
			{
				id: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu#key',
				controller: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu',
				type: 'Ed25519VerificationKey2018',
				publicKeyBase58: 'DDBJgEUNmWisGf4Zh6MazAtef7V5BjVJdEYKo2yRLYVp'
			}
		],
		created: '2021-03-24T15:54:33Z',
		updated: '2021-03-24T15:54:33Z',
		immutable: false,
		proof: {
			type: 'JcsEd25519Signature2020',
			verificationMethod: '#key',
			signatureValue: '4tyirinqCRqf3Sa4RMwFocrjJWqAWuLFWWP3oGzkhvA7SbjbFNXKfPRPxePtixgzsdvBubd6f4VR23jvaV1c44y'
		}
	},
	userData: {
		userId: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu',
		publicKey: 'DDBJgEUNmWisGf4Zh6MazAtef7V5BjVJdEYKo2yRLYVp',
		username: 'test-device',
		type: 'product',
		subscribedChannelIds: ['test-address-c2', 'test-address'],
		description: 'Device which measures temperature in the kitchen.',
		registrationDate: '2021-04-13T11:01:32Z',
		organization: 'IOTA',
		data: {
			category: 'heater',
			location: {
				lat: 49.123,
				lon: 7.123
			}
		},
		role: 'user'
	},
	key: {
		type: 'ed25519',
		public: 'DDBJgEUNmWisGf4Zh6MazAtef7V5BjVJdEYKo2yRLYVp',
		secret: 'DNXNBLFwsFnuvpyo81krNQhAiyQFCTv2yVon6uD22bVR'
	},
	encoding: 'base58',
	txHash: 'CETPVHOIBPNGCWQQCQALVKQQOD9B9MLMU9ZMNFZHBPEAOTMWFTVDRRBMFYIETHDWXA9GLGYWAFQRA9999'
};

export const CLIENT_IDENTITY = DeviceIdentity;
