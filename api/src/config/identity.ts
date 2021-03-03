// TODO this need to be created for the api once and stored as ENV var

export const ServerRootDoc = {
  id: 'did:iota:HY5emusajDvhiYP6gTM7WrfVXbWJMSosWfPRA7QDVXxF',
  created: '2021-03-01T15:00:26Z',
  updated: '2021-03-01T15:00:26Z',
  immutable: false
};
export const SERVER_ROOT_KEYS = {
  type: 'ed25519',
  public: 'ELM57aH5pftJd6mBRbhiY6Sxpg7W1d2zLMWMCU81GuJR',
  secret: 'GCv7Cvc4sx1oxVA9LPTfuZMzwNDscY52Lap9rLoWfFDU'
};

export const SERVER_IDENTITY = {
  doc: {
    id: 'did:iota:Fs6E3azeJDZyHA2xAWBtiybSVucPJPsmbB2ZCsiMMj9j',
    verificationMethod: [
      {
        id: 'did:iota:Fs6E3azeJDZyHA2xAWBtiybSVucPJPsmbB2ZCsiMMj9j#key-collection',
        controller: 'did:iota:Fs6E3azeJDZyHA2xAWBtiybSVucPJPsmbB2ZCsiMMj9j',
        type: 'MerkleKeyCollection2021',
        publicKeyBase58: '11Aicsgq1C7rTH8hWK4eLPnN65NTCi7nRuPA7bkPz8g9tg',
        revocation: 'OjAAAAEAAAAAAAAAEAAAAAAA'
      }
    ],
    authentication: [
      {
        id: 'did:iota:Fs6E3azeJDZyHA2xAWBtiybSVucPJPsmbB2ZCsiMMj9j#key',
        controller: 'did:iota:Fs6E3azeJDZyHA2xAWBtiybSVucPJPsmbB2ZCsiMMj9j',
        type: 'Ed25519VerificationKey2018',
        publicKeyBase58: '4XTBhU4NkPUvbQtVyEcSChdsZFJj8Bi1ZzDKxiR8U2Jz'
      }
    ],
    created: '2021-03-01T17:59:00Z',
    updated: '2021-03-01T17:59:00Z',
    immutable: false,
    previous_message_id: 'BDJDNMZRMFBROZHVKMWGOEWLOTPMSYXKKSARCTLGFPMGULCUEV9ETBPXTJXIMGESPX9ZOGWCWWBFZ9999',
    proof: {
      type: 'JcsEd25519Signature2020',
      verificationMethod: '#key',
      signatureValue: '5HJfDhtA6NnLcHxp8d94otDapQjnfSC9jrV8r6Q3EpCQfgnsxb7XNdrQ15H2K6Lk96YApvgVBmbFNz32wu4EFCeu'
    }
  },
  key: { type: 'ed25519', public: '4XTBhU4NkPUvbQtVyEcSChdsZFJj8Bi1ZzDKxiR8U2Jz', secret: '276ECDqffWxCG7LBkMQUvVxw4cYY7Y8pMjPFK7t4YMqh' },
  name: 'Bob',
  message: 'IQ9XMNVDCJKFKAHHLNQMJRLRZODLGRQIULLMYLYCHRBYRJYCCKOCVLQUCOBTCBDYGMWHYLRCNAWGZ9999'
};
