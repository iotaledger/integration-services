export const Config = {
	baseUrl: process.env.BASE_URL
};

export const users = [
	{
		_id: 'did:iota:6cTkp3gCV3yifiGDHUK4x1omXb6yFBTRg7NS2x3kBDUm',
		userId: 'did:iota:6cTkp3gCV3yifiGDHUK4x1omXb6yFBTRg7NS2x3kBDUm',
		publicKey: 'HmvXxyyzaA9B5CMp63xG9ptEkgwmHgaYVStdDsYxzDTX',
		username: 'test-device',
		type: 'Device',
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
		registrationDate: '2021-05-10T17:23:18+02:00',
		organization: 'IOTA',
		data: {
			familyName: 'Testinomium',
			givenName: 'Testa'
		},
		role: 'User'
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
		previousMessageId: 'ANZAUTTZHLIJADRODGCTESKILHXCIVMZHSYDWYINODE9OMUDV9CWPPUFMDAURXUNJASFNBWPRSPOZ9999',
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
		type: 'Service',
		registrationDate: '2021-05-10T17:18:58+02:00',
		organization: 'IOTA',
		data: {},
		role: 'Admin'
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
		type: 'Device',
		registrationDate: '2021-05-10T17:16:39+02:00',
		organization: 'IOTA',
		data: {
			id: 'test-device',
			type: 'Device',
			category: ['sensor'],
			controlledProperty: ['fillingLevel', 'temperature'],
			controlledAsset: ['wastecontainer-Osuna-100'],
			ipAddress: ['192.14.56.78'],
			mcc: '214',
			mnc: '07',
			batteryLevel: 0.75,
			serialNumber: '9845A',
			refDeviceModel: 'myDevice-wastecontainer-sensor-345',
			rssi: 0.86,
			value: 'l%3D0.22%3Bt%3D21.2',
			deviceState: 'ok',
			dateFirstUsed: '2014-09-11T11:00:00Z',
			owner: ['http://person.org/leon']
		},
		role: 'User'
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
