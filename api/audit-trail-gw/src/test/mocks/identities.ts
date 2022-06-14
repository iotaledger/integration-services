import { Encoding, IdentityJson, IdentityKeys, User, UserType } from '@iota/is-shared-modules';

export const TestUsersMock = [
	{
		_id: 'did:iota:6cTkp3gCV3yifiGDHUK4x1omXb6yFBTRg7NS2x3kBDUm',
		id: 'did:iota:6cTkp3gCV3yifiGDHUK4x1omXb6yFBTRg7NS2x3kBDUm',
		publicKey: 'HmvXxyyzaA9B5CMp63xG9ptEkgwmHgaYVStdDsYxzDTX',
		username: 'test-device',
		type: 'Device',
		registrationDate: '2021-03-15T10:29:56+01:00',
		claim: {
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
		}
	},
	{
		id: 'did:iota:6cTkp3gCV3yifiGDHUK4x1omXb6yFBTRg7NS2x3kBDUm',
		username: 'second-user',
		type: 'Person',
		registrationDate: '2021-03-15T10:29:56+01:00',
		claim: {
			familyName: 'Tomson',
			givenName: 'Brandon'
		}
	},
	{
		id: 'did:iota:6cTkp3gCV3yifiGDHUK4x1omXb6yFBTRg7NS2x3kBDUm',
		username: 'another-iota-user',
		firstName: 'Jon',
		lastName: 'Keen',
		type: 'Person',
		registrationDate: '2021-03-15T10:29:56+01:00',
		claim: {
			familyName: 'Keen',
			givenName: 'Jon'
		}
	}
];

// returned from localhost:3000/api/v1/identities/create
export const UserIdentityMock = {
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
		id: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
		publicKey: '8WaGsr277JQaqV9fxHmFNGC9haApFbBfdnytmq5gq4vm',
		username: 'first-user',
		claim: { type: 'Person', firstName: 'Tom', lastName: 'Sonson' },
		registrationDate: '2021-03-16T15:18:49+01:00',
		verifiableCredentials: [
			{
				'@context': 'https://www.w3.org/2018/credentials/v1',
				id: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
				type: ['VerifiableCredential', 'PersonCredential'],
				credentialSubject: {
					id: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
					type: UserType.Person,
					registrationDate: '2021-03-16T15:18:49+01:00',
					username: 'first-user',
					initiatorId: ''
				},
				issuer: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
				issuanceDate: '2021-03-24T15:59:11Z',
				proof: {
					type: 'MerkleKeySignature2021',
					verificationMethod: '#key-collection',
					signatureValue:
						'E7YtcGcEJuWE69djaDGZL425Qh3pCuhhF3RPum3Mm1WJ.1119t2nv9LDH5Qi8CgAK1P5W78XLxFgHjGddZW5ct1isxnaB5ZF7LPToUuxhgrbdZLfyhY2LSf3djsRjyE6wyeMVTE9w7BJZg8cZx6egUAPEy1DNzyZZXZkZWyjHqZAmZ2B24xwfyFd.32W1cWdfRK8YZ5sTDe7fpCzyqVtQQRc7Fkauygp4MUb4GUPd9TG8CBiktnvDgzC9SxtXJfCVc7Euf5N7H88o7nSU'
				}
			}
		]
	},
	key: {
		type: 'ed25519',
		public: '8WaGsr277JQaqV9fxHmFNGC9haApFbBfdnytmq5gq4vm',
		secret: 'DadU1UNQfhTJrBHvYaML8wnxvJUEBsx7DtUvXSti5Mp8',
		encoding: Encoding.base58
	}
} as IdentityJson & { userData: User };

export const ServerIdentityMock = {
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
		id: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
		publicKey: '5r7cbQkEXi2srrNUrVDkB79NnPuiBguWsPDvS6nY7yEb',
		username: 'api-identity',
		registrationDate: '2021-03-24T15:38:43+01:00',
		verifiableCredentials: [
			{
				'@context': 'https://www.w3.org/2018/credentials/v1',
				id: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
				type: ['VerifiableCredential', 'VerifiedIdentityCredential'],
				credentialSubject: {
					id: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
					type: 'Person',
					registrationDate: '2021-03-24T15:38:43+01:00',
					username: 'api-identity',
					initiatorId: ''
				},
				issuer: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
				issuanceDate: '2021-03-24T14:38:45Z',
				proof: {
					type: 'MerkleKeySignature2021',
					verificationMethod: '#key-collection',
					signatureValue:
						'8rVDt6KCPoZVhMCGG5AQLZaUjFJ5LLv4iXsaoQjeqQpq.1117uJFpmAB6msQ9GdsSRvxfdSvfTas94EippDqh6foKFTY1diqiCzfAuqYVExhxeJGBYycQiDbxwGev9Chrtz51UYVbwUL1DR8gipj3zuZa4X2SF7UnTbAw74Dv3o2qsqi2FsxtssV.52yNV25JkS9sRw2tSCKw4yQ3hY4fEneEpk82vU9UX2G5vGJsPhvpjSwfX2cxvqJ48E8EvwDCXrFuetyLPLVQ1UGY'
				}
			},
			{
				'@context': 'https://www.w3.org/2018/credentials/v1',
				id: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
				type: ['VerifiableCredential', 'SomeBasicCredential'], // not valid credential to verify others
				credentialSubject: {
					id: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
					type: 'Person',
					registrationDate: '2021-03-24T15:38:43+01:00',
					username: 'api-identity',
					initiatorId: ''
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
		]
	},
	key: {
		type: 'ed25519',
		public: '5r7cbQkEXi2srrNUrVDkB79NnPuiBguWsPDvS6nY7yEb',
		secret: '6rK7CLKdDw9kBYLQhH4A11vpeS1Hw9jvZagrqgtGcGEp',
		encoding: Encoding.base58
	}
} as IdentityJson & { userData: User };

export const ServerIdentityKey: IdentityKeys = {
	id: ServerIdentityMock.doc.id,
	key: ServerIdentityMock.key
};

export const DeviceIdentityMock = {
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
		id: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu',
		publicKey: 'DDBJgEUNmWisGf4Zh6MazAtef7V5BjVJdEYKo2yRLYVp',
		username: 'test-device',
		registrationDate: '2021-03-24T16:54:38+01:00',
		verifiableCredentials: [
			{
				'@context': 'https://www.w3.org/2018/credentials/v1',
				id: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu',
				type: ['VerifiableCredential', 'DeviceCredential'],
				credentialSubject: {
					id: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu',
					type: 'Device',
					registrationDate: '2021-03-24T16:54:38+01:00',
					username: 'test-device',
					initiatorId: ''
				},
				issuer: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
				issuanceDate: '2021-03-24T15:58:59Z',
				proof: {
					type: 'MerkleKeySignature2021',
					verificationMethod: '#key-collection',
					signatureValue:
						'9fNqgZfFZTnt6HpyRD2yXRovijjewVTpGSzwNX4YvPb1.1117u9ibPzu8itzHAWjLdo6j7vTWdWCuvADY1oUqrJLxUmQkCnhEgJWBoASweLXoJAPYuUe8iyyYEgoaQDDTHhaL5xZQ8fK6nbw67qLo5BuTbQHiqpnintZph9TjKFep7pk6zoLMGdD.3xh4r38iiLhXyjBwdJPMqzSyrJAtSp3u3pJUGTGydyN45rTEWXfqPEDLw8ux9ttXijADTH5SAwr924Agnk2Vm3wA'
				}
			}
		]
	},
	key: {
		type: 'ed25519',
		public: 'DDBJgEUNmWisGf4Zh6MazAtef7V5BjVJdEYKo2yRLYVp',
		secret: 'DNXNBLFwsFnuvpyo81krNQhAiyQFCTv2yVon6uD22bVR',
		encoding: Encoding.base58
	}
} as IdentityJson & { userData: User };

export const TestCredentialMock = {
	'@context': 'https://www.w3.org/2018/credentials/v1',
	id: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu',
	type: ['VerifiableCredential', 'DeviceCredential'],
	credentialSubject: {
		id: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu',
		type: 'Device',
		registrationDate: '2021-03-24T16:54:38+01:00',
		username: 'test-device',
		initiatorId: ''
	},
	issuer: 'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
	issuanceDate: '2021-03-24T15:58:59Z',
	proof: {
		type: 'MerkleKeySignature2021',
		verificationMethod: '#key-collection',
		signatureValue:
			'9fNqgZfFZTnt6HpyRD2yXRovijjewVTpGSzwNX4YvPb1.1117u9ibPzu8itzHAWjLdo6j7vTWdWCuvADY1oUqrJLxUmQkCnhEgJWBoASweLXoJAPYuUe8iyyYEgoaQDDTHhaL5xZQ8fK6nbw67qLo5BuTbQHiqpnintZph9TjKFep7pk6zoLMGdD.3xh4r38iiLhXyjBwdJPMqzSyrJAtSp3u3pJUGTGydyN45rTEWXfqPEDLw8ux9ttXijADTH5SAwr924Agnk2Vm3wA'
	}
};
