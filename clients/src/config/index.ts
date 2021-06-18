export const Config = {
	baseUrl: process.env.BASE_URL
};

// returned from localhost:3000/api/v1/identities/create
export const UserIdentity = {
	doc: {
		id: 'did:iota:CtPnfQqSZBmZEe5A5iNZzJ6pkCqUxtsFsErNfA3CeHpY',
		authentication: [
			{
				id: 'did:iota:CtPnfQqSZBmZEe5A5iNZzJ6pkCqUxtsFsErNfA3CeHpY#key',
				controller: 'did:iota:CtPnfQqSZBmZEe5A5iNZzJ6pkCqUxtsFsErNfA3CeHpY',
				type: 'Ed25519VerificationKey2018',
				publicKeyBase58: 'D58X2pvwvSBsYtwC8KCqkpu6EgEUUiiGbrjqsciXFhmW'
			}
		],
		created: '2021-06-18T11:30:38Z',
		updated: '2021-06-18T11:30:38Z',
		proof: {
			type: 'JcsEd25519Signature2020',
			verificationMethod: '#key',
			signatureValue: '2oV3HJDoCzbWqNpp4kQGUiGCTuRCBohf6SoqXHs2DBwXqqByQa5kCstKrXZvUU6ffyuoo24iacpu1kw19riLsXJR'
		}
	},
	key: {
		type: 'ed25519',
		public: 'D58X2pvwvSBsYtwC8KCqkpu6EgEUUiiGbrjqsciXFhmW',
		secret: 'A97kLy9bhL8EamN43AU2WTGMhKXGyqfxWxTiEnVRBo4w',
		encoding: 'base58'
	},
	txHash: 'acf6b65c8c295677b8e06f1751c5043eb86c276dee4e53da797e0229bfa8ad58'
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
		id: 'did:iota:H7csnzWEec9oDZb29bkcvK3hRrRxFkacWtdW3p9c26Mt',
		authentication: [
			{
				id: 'did:iota:H7csnzWEec9oDZb29bkcvK3hRrRxFkacWtdW3p9c26Mt#key',
				controller: 'did:iota:H7csnzWEec9oDZb29bkcvK3hRrRxFkacWtdW3p9c26Mt',
				type: 'Ed25519VerificationKey2018',
				publicKeyBase58: '4jYw13y25JgbFk9RnNwUVC2Y3qkT8DRFBqXLEHwkFvjR'
			}
		],
		created: '2021-06-18T11:35:24Z',
		updated: '2021-06-18T11:35:24Z',
		proof: {
			type: 'JcsEd25519Signature2020',
			verificationMethod: '#key',
			signatureValue: 'QPzT7MPKE2raRycrreyQbrmmMwamfqzNn7sHdhhPbFyswcNBQTiymBxMz2iGPqHo4ELRcgsaJiDCNfunTTnmBav'
		}
	},
	key: {
		type: 'ed25519',
		public: '4jYw13y25JgbFk9RnNwUVC2Y3qkT8DRFBqXLEHwkFvjR',
		secret: '9wX7BuNhQFUk9p8hw3dVwMgRUtD9T4gRJgGcmwCQ1PsF',
		encoding: 'base58'
	},
	txHash: 'da537611d039d5a5a39a17e89cfac1fa393656fefd2afea237ee63af6d539b8d'
};

export const CLIENT_IDENTITY = DeviceIdentity;
