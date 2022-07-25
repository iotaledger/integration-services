import { IdentityKeys, User, UserType } from '@iota/is-shared-modules';
import { IdentityDocument, Keys } from '../../../../shared-modules/src/web/models/types/identity';

export const TestUsersMock = [
	{
		_id: 'did:iota:6cTkp3gCV3yifiGDHUK4x1omXb6yFBTRg7NS2x3kBDUm',
		id: 'did:iota:6cTkp3gCV3yifiGDHUK4x1omXb6yFBTRg7NS2x3kBDUm',
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
	document: {
		doc: {
			id: 'did:iota:EMjd32WoJqWMHnktc3TrjdMH6brTovTe5bGpPrVuDdKi',
			capabilityInvocation: [
				{
					id: 'did:iota:EMjd32WoJqWMHnktc3TrjdMH6brTovTe5bGpPrVuDdKi#sign-0',
					controller: 'did:iota:EMjd32WoJqWMHnktc3TrjdMH6brTovTe5bGpPrVuDdKi',
					type: 'Ed25519VerificationKey2018',
					publicKeyMultibase: 'zGPpRru9YxgY2amWqzAkWbLwuL25x47o73oBhp4f5avij'
				}
			]
		},
		integrationMessageId: 'mymessage',
		meta: {
			created: '2022-07-21T15:26:04Z',
			updated: '2022-07-21T15:26:04Z'
		},
		proof: {
			type: 'JcsEd25519Signature2020',
			verificationMethod: 'did:iota:EMjd32WoJqWMHnktc3TrjdMH6brTovTe5bGpPrVuDdKi#sign-0',
			signatureValue: 'UnFqyMkHVLP3ToyE8bteiEukjmHbQbtWzstYByNgJrCZxTosHdXsx4k4VzRNE6KZffPJFpkNv6dyXFfmv7tc2n5'
		}
	},
	userData: {
		id: 'did:iota:EMjd32WoJqWMHnktc3TrjdMH6brTovTe5bGpPrVuDdKi',
		username: 'first-user',
		creator: 'did:iota:96JyhhVGbaLheq2L8j39DiAe8o3ijTHoCWWmai3D7PNk',
		claim: { type: 'Person', firstName: 'Tom', lastName: 'Sonson' },
		registrationDate: '2021-03-16T15:18:49+01:00',
		verifiableCredentials: [
			{
				'@context': 'https://www.w3.org/2018/credentials/v1',
				id: 'did:iota:EMjd32WoJqWMHnktc3TrjdMH6brTovTe5bGpPrVuDdKi',
				type: ['VerifiableCredential', 'PersonCredential'],
				credentialSubject: {
					id: 'did:iota:EMjd32WoJqWMHnktc3TrjdMH6brTovTe5bGpPrVuDdKi',
					type: UserType.Person,
					registrationDate: '2021-03-16T15:18:49+01:00',
					username: 'first-user',
					initiatorId: ''
				},
				issuer: 'did:iota:GEpCtmCAqr9mdR1zC5iL6bg1jAq8NmR8QmmdH8T7eFtm',
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
	keys: {
		sign: {
			public: 'GPpRru9YxgY2amWqzAkWbLwuL25x47o73oBhp4f5avij',
			private: 'GLqGAR11K989PGkoVwibkmE7bdw6tQafVf2DCQj9JQrQ',
			type: 'ed25519',
			encoding: 'base58'
		}
	}
} as { document: IdentityDocument } & { userData: User } & { keys: Keys };

export const ServerIdentityMock = {
	document: {
		doc: {
			id: 'did:iota:GEpCtmCAqr9mdR1zC5iL6bg1jAq8NmR8QmmdH8T7eFtm',
			capabilityInvocation: [
				{
					id: 'did:iota:GEpCtmCAqr9mdR1zC5iL6bg1jAq8NmR8QmmdH8T7eFtm#sign-0',
					controller: 'did:iota:GEpCtmCAqr9mdR1zC5iL6bg1jAq8NmR8QmmdH8T7eFtm',
					type: 'Ed25519VerificationKey2018',
					publicKeyMultibase: 'zBojkSuALfcNGQfPX52f8sNF23To2by99KGHLeWB9wDza'
				}
			]
		},
		integrationMessageId: 'mymessage',
		meta: {
			created: '2022-07-21T14:52:49Z',
			updated: '2022-07-21T14:52:49Z'
		},
		proof: {
			type: 'JcsEd25519Signature2020',
			verificationMethod: 'did:iota:GEpCtmCAqr9mdR1zC5iL6bg1jAq8NmR8QmmdH8T7eFtm#sign-0',
			signatureValue: '54KYBA2STMvYosWKFqa7Pv2hSyk1PdgNYf6oqTyjUy9j3jEANAD84uuSpHrP2MtfdTeJesaUrqpigBbaeQuWuFV8'
		}
	},
	userData: {
		id: 'did:iota:GEpCtmCAqr9mdR1zC5iL6bg1jAq8NmR8QmmdH8T7eFtm',
		username: 'api-identity',
		registrationDate: '2021-03-24T15:38:43+01:00',
		verifiableCredentials: [
			{
				'@context': 'https://www.w3.org/2018/credentials/v1',
				id: 'did:iota:4wUQAs9zrPGuq5txf3m88g7gosfxS24Tzr4V9SiDT8Sc',
				type: ['VerifiableCredential', 'VerifiedIdentityCredential'],
				credentialSubject: {
					id: 'did:iota:4wUQAs9zrPGuq5txf3m88g7gosfxS24Tzr4V9SiDT8Sc',
					'@context': 'https://schema.org/',
					familyName: 'Enginssseer',
					givenName: 'Test',
					initiatorId: 'did:iota:AUKN9UkJrTGGBcTZiYC3Yg2FLPQWnA11X8z6D6DDn56Y',
					jobTitle: 'Software Engineer',
					name: 'Test Engineer',
					type: 'Person'
				},
				issuer: 'did:iota:4wUQAs9zrPGuq5txf3m88g7gosfxS24Tzr4V9SiDT8Sc',
				issuanceDate: '2022-07-20T08:15:32Z',
				credentialStatus: {
					id: 'did:iota:4wUQAs9zrPGuq5txf3m88g7gosfxS24Tzr4V9SiDT8Sc#signature-bitmap-0',
					type: 'RevocationBitmap2022',
					revocationBitmapIndex: 6
				},
				proof: {
					type: 'JcsEd25519Signature2020',
					verificationMethod: 'did:iota:4wUQAs9zrPGuq5txf3m88g7gosfxS24Tzr4V9SiDT8Sc#sign-0',
					signatureValue: 'QESXmEUkdALsJvME2AWS7ZbFzKwopTNdEoqcy6vBDJGKVEeUW6Gz4dzGd6paX7JvYd25JJsz4BtWBUaoTog3ErM'
				}
			}
		]
	},
	keys: {
		sign: {
			public: 'BojkSuALfcNGQfPX52f8sNF23To2by99KGHLeWB9wDza',
			private: '8UCqDS5erHTJZRRqyqbLsxY5ED6ciYGttEhUU56rRVvA',
			type: 'ed25519',
			encoding: 'base58'
		}
	}
} as { document: IdentityDocument } & { userData: User } & { keys: Keys };

export const ServerIdentityKey: IdentityKeys = {
	id: ServerIdentityMock.document.doc.id,
	keys: ServerIdentityMock.keys
};

export const DeviceIdentityMock = {
	userData: {
		id: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu',
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
					initiator: ''
				},
				issuer: 'did:iota:GEpCtmCAqr9mdR1zC5iL6bg1jAq8NmR8QmmdH8T7eFtm',
				issuanceDate: '2021-03-24T15:58:59Z',
				proof: {
					type: 'MerkleKeySignature2021',
					verificationMethod: '#key-collection',
					signatureValue:
						'9fNqgZfFZTnt6HpyRD2yXRovijjewVTpGSzwNX4YvPb1.1117u9ibPzu8itzHAWjLdo6j7vTWdWCuvADY1oUqrJLxUmQkCnhEgJWBoASweLXoJAPYuUe8iyyYEgoaQDDTHhaL5xZQ8fK6nbw67qLo5BuTbQHiqpnintZph9TjKFep7pk6zoLMGdD.3xh4r38iiLhXyjBwdJPMqzSyrJAtSp3u3pJUGTGydyN45rTEWXfqPEDLw8ux9ttXijADTH5SAwr924Agnk2Vm3wA'
				}
			}
		]
	}
} as { userData: User };

export const TestCredentialMock = {
	'@context': 'https://www.w3.org/2018/credentials/v1',
	id: 'did:iota:4wUQAs9zrPGuq5txf3m88g7gosfxS24Tzr4V9SiDT8Sc',
	type: ['VerifiableCredential', 'VerifiedIdentityCredential'],
	credentialSubject: {
		id: 'did:iota:4wUQAs9zrPGuq5txf3m88g7gosfxS24Tzr4V9SiDT8Sc',
		'@context': 'https://schema.org/',
		familyName: 'Engineer',
		givenName: 'Test',
		initiatorId: 'did:iota:AUKN9UkJrTGGBcTZiYC3Yg2FLPQWnA11X8z6D6DDn56Y',
		jobTitle: 'Software Engineer',
		name: 'Test Engineer',
		type: 'Person'
	},
	issuer: 'did:iota:4wUQAs9zrPGuq5txf3m88g7gosfxS24Tzr4V9SiDT8Sc',
	issuanceDate: '2022-07-21T14:49:14Z',
	credentialStatus: {
		id: 'did:iota:4wUQAs9zrPGuq5txf3m88g7gosfxS24Tzr4V9SiDT8Sc#signature-bitmap-0',
		type: 'RevocationBitmap2022',
		revocationBitmapIndex: 7
	},
	proof: {
		type: 'JcsEd25519Signature2020',
		verificationMethod: 'did:iota:4wUQAs9zrPGuq5txf3m88g7gosfxS24Tzr4V9SiDT8Sc#sign-0',
		signatureValue: 'Ug3k7V6BufDDcW6VRJwGpmsvE3bbwDv84x8en6ERhmgnfubxTZ5fBZJ6Ky9YUuqZhqpoQWqdmcLVYQTEE6qVe7u'
	}
};
