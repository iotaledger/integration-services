export const Config = {
	baseUrl: process.env.BASE_URL
};

// returned from localhost:3000/api/v1/authentication/create-identity
export const ClientIdentity = {
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
	key: {
		type: 'ed25519',
		public: '8WaGsr277JQaqV9fxHmFNGC9haApFbBfdnytmq5gq4vm',
		secret: 'DadU1UNQfhTJrBHvYaML8wnxvJUEBsx7DtUvXSti5Mp8'
	},
	txHash: 'OGNVRNPA9LQKPEUQJEECRZRVMRAQA99RVTVUPIYQQGYVVFYBDRIHZGFVQQVKQHAPVGCZKMGUTZXAZ9999'
};
