export const Config = {
	baseUrl: process.env.BASE_URL
};

// returned from localhost:3000/api/v1/identities/create
export const UserIdentity = {
	doc: {
		id: 'did:iota:AF1ss8QmCM9feWEERRBjZH72Hpg6eUvVK9jHpwz3sgcc',
		authentication: [
			{
				id: 'did:iota:AF1ss8QmCM9feWEERRBjZH72Hpg6eUvVK9jHpwz3sgcc#key',
				controller: 'did:iota:AF1ss8QmCM9feWEERRBjZH72Hpg6eUvVK9jHpwz3sgcc',
				type: 'Ed25519VerificationKey2018',
				publicKeyBase58: '3Nr7KTziPR5ZJK5djVvrnNHUdSpdqex5uuLn8LU5zX7X'
			}
		],
		created: '2021-05-20T08:40:42Z',
		updated: '2021-05-20T08:40:42Z',
		proof: {
			type: 'JcsEd25519Signature2020',
			verificationMethod: '#key',
			signatureValue: '3Zy52A4rdLZLqawH86rEsbquhWmVkRwDw8rxNTWZkt8TZFE8kUfwPiXEjRRv1BfLxMoepRs8fabnoZv4TZtppDYr'
		}
	},
	userData: {
		identityId: 'did:iota:AF1ss8QmCM9feWEERRBjZH72Hpg6eUvVK9jHpwz3sgcc',
		publicKey: '3Nr7KTziPR5ZJK5djVvrnNHUdSpdqex5uuLn8LU5zX7X',
		username: 'iota-test',
		type: 'Person',
		registrationDate: '2021-05-20T10:40:47+02:00',
		organization: 'did:iota:Hkac4k6xsuDdn7fQms6yMJsySRDDC4fH962MwP9dxWse',
		claim: {
			name: 'Test User',
			familyName: 'User',
			givenName: 'Test',
			jobTitle: 'Software Engineer'
		},
		role: 'User'
	},
	key: {
		type: 'ed25519',
		public: '3Nr7KTziPR5ZJK5djVvrnNHUdSpdqex5uuLn8LU5zX7X',
		secret: 'Ch5HptuinwJXQXuCvjpnNeZUBsJrQ9wYZtY3SDPQRh2h',
		encoding: 'base58'
	},
	txHash: 'fce665229c9156c0fc90ab484417a7405cd2aa241f396c89d128ee26a39d5e5e'
};

export const ServerIdentity = {
	doc: {
		id: 'did:iota:AUKN9UkJrTGGBcTZiYC3Yg2FLPQWnA11X8z6D6DDn56Y',
		authentication: [
			{
				id: 'did:iota:AUKN9UkJrTGGBcTZiYC3Yg2FLPQWnA11X8z6D6DDn56Y#key',
				controller: 'did:iota:AUKN9UkJrTGGBcTZiYC3Yg2FLPQWnA11X8z6D6DDn56Y',
				type: 'Ed25519VerificationKey2018',
				publicKeyBase58: 'GmNyvaJESvUgLL42Zo5Lar1QRN9rDTBtxC4wMbNC7S4w'
			}
		],
		created: '2021-05-20T08:46:54Z',
		updated: '2021-05-20T08:46:54Z',
		proof: {
			type: 'JcsEd25519Signature2020',
			verificationMethod: '#key',
			signatureValue: '47d1rNxyJbTCtPAdLMv5C7tS8xcSyPNApSWKyqWWpXNCnciqZDHVLMV24ghPavCtiwmuf1daRhcuxcX5kz9pU53W'
		}
	},
	key: {
		type: 'ed25519',
		public: 'GmNyvaJESvUgLL42Zo5Lar1QRN9rDTBtxC4wMbNC7S4w',
		secret: 'FpiRnxwUbiNrkiWCatkhzYPZBJBhGdWQNt1BUikixA3P',
		encoding: 'base58'
	},
	userData: {
		identityId: 'did:iota:AUKN9UkJrTGGBcTZiYC3Yg2FLPQWnA11X8z6D6DDn56Y',
		publicKey: 'GmNyvaJESvUgLL42Zo5Lar1QRN9rDTBtxC4wMbNC7S4w',
		username: 'iota-service-test',
		type: 'Service',
		registrationDate: '2021-05-20T10:47:16+02:00',
		organization: 'did:iota:Hkac4k6xsuDdn7fQms6yMJsySRDDC4fH962MwP9dxWse',
		claim: {
			name: 'Test Service',
			description: 'Just a test service to verify users.'
		},
		role: 'Admin'
	},
	txHash: '91e85c4a3b90eb8be0ea688a671c00611c7363a0d07fecf4dd37d1f4610661d6'
};

export const DeviceIdentity = {
	doc: {
		id: 'did:iota:4tc84TCUDpcUg4Lsf6MsumYBHDKskQVJrzq9HcL3pWXW',
		authentication: [
			{
				id: 'did:iota:4tc84TCUDpcUg4Lsf6MsumYBHDKskQVJrzq9HcL3pWXW#key',
				controller: 'did:iota:4tc84TCUDpcUg4Lsf6MsumYBHDKskQVJrzq9HcL3pWXW',
				type: 'Ed25519VerificationKey2018',
				publicKeyBase58: '14Wh9W552EnJWAWV5UbtmNM2mEBb9RDgsbnnComZcYPM'
			}
		],
		created: '2021-05-20T08:43:01Z',
		updated: '2021-05-20T08:43:01Z',
		proof: {
			type: 'JcsEd25519Signature2020',
			verificationMethod: '#key',
			signatureValue: '4VUKEJ2sbbCf7GWs4phmaZLs8jcGJAPXUQS5zUkbQaUaZwnvcS7jq6sTa5CExhYAKVEJPFsEutPypxBbnUwp4bE'
		}
	},
	userData: {
		identityId: 'did:iota:4tc84TCUDpcUg4Lsf6MsumYBHDKskQVJrzq9HcL3pWXW',
		publicKey: '14Wh9W552EnJWAWV5UbtmNM2mEBb9RDgsbnnComZcYPM',
		username: 'iota-test-device',
		type: 'Device',
		registrationDate: '2021-05-20T10:43:02+02:00',
		organization: 'did:iota:Hkac4k6xsuDdn7fQms6yMJsySRDDC4fH962MwP9dxWse',
		claim: {
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
			value: 'l=0.22;t=21.2',
			deviceState: 'ok',
			dateFirstUsed: '2014-09-11T11:00:00Z',
			owner: ['http://person.org/leon']
		},
		role: 'User'
	},
	key: {
		type: 'ed25519',
		public: '14Wh9W552EnJWAWV5UbtmNM2mEBb9RDgsbnnComZcYPM',
		secret: 'AsxeJjhBnWaxwNzhKpJrwyXgzEbzmiPDDGLznVcjrvwd',
		encoding: 'base58'
	},
	txHash: '654a1514ea0cc1220ef7e173408fdec4c154a5ee1bcbc194a6a50f62b819664b'
};

export const CLIENT_IDENTITY = DeviceIdentity;
