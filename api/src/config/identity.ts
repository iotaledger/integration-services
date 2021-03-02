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

export const SERVER_KEY_COLLECTION = {
  type: 'ed25519',
  keys: [
    {
      public: '3MNG9dK7RZ25ksYzLRB34Rb4Cao7t4F5J2wxJ2rkjhdS',
      secret: 'GKng7K6EdycQQZmeySztwGY5Q63xisKV8HHYoKCVpXTu'
    },
    {
      public: 'HsLtLbK5iNYokSnoB7Ddt5Q1DES1CQcbdq1rzsDg1tEg',
      secret: 'D12qvQUTiiVRQT9frShNy5sMWy8ycjYqD5yXaYSJixLW'
    },
    {
      public: '8zvjfhcp4pYxKEacK8o7ctpsozjxKkDePUk5VZ52Mgo4',
      secret: '91hBX6k6Ax1pTTgaJtBWp9p1AzQTMAVRfDY4N98nFqZh'
    },
    {
      public: 'G97GrNS2TEGCDF3gfjEe9i1AJ35Fo3GhqA8xotopFKY1',
      secret: '8cPrFfSev5RRu9fVPrSnbMVXAE91b9F2iGCgdsHgHKHx'
    },
    {
      public: 'BBJbyESSwTZwk46dFtXzTzm3USEMwXAYTVyT7pGbyVT7',
      secret: '42gQh8WmmBu7EmuToXESKmbQqUysKQTkj7x1zRrR5or6'
    },
    {
      public: 'E1CKBWhju3yF4cg2rEzWhUqSg5xhCd3txyuMSTHydoeh',
      secret: '2DGNEt9E9jbLmfzAQt1df1YAyFyFvjcNwNQZhJyB78VN'
    },
    {
      public: '278n2jjJktcVQZM4nu9z95exTHc56Q3ScgSQv16NHFpx',
      secret: '4okbHrzvE6g1TkBDU1a7Jhvkn4j3QNtL6chZWywxBHiL'
    },
    {
      public: 'AduDU76bgeDVWC58MMHZwTsqPgFVJW2DqtiuWKhpSaTC',
      secret: 'DErDhF9eMUGZXt3o9Puv1UDyTCP1LDUbVYjAgURN36Jb'
    }
  ]
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
