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

// TODO Currently we use only one key collection but for prod this key collection might run out of index so they must be created dynamically
// see ticket: https://app.zenhub.com/workspaces/e-commerce-audit-log-5f61d95cdfcfd03a6193cc6f/issues/iotaledger/e-commerce-audit-log/54
export const KEY_COLLECTION_INDEX = 0;

export const SERVER_IDENTITY = {
  doc: {
    id: 'did:iota:58ZbAVJWSNWPyNgcJmUGxsXAKRjvq2rAfefNxRyTUZji',
    verificationMethod: [
      {
        id: 'did:iota:58ZbAVJWSNWPyNgcJmUGxsXAKRjvq2rAfefNxRyTUZji#key-collection',
        controller: 'did:iota:58ZbAVJWSNWPyNgcJmUGxsXAKRjvq2rAfefNxRyTUZji',
        type: 'MerkleKeyCollection2021',
        publicKeyBase58: '113pzRK1d3HCDxDH11PKftjszMCjoaznEQDjDqEKiQ2Zse',
        revocation: 'OjAAAAEAAAAAAAAAEAAAAAAA'
      }
    ],
    authentication: [
      {
        id: 'did:iota:58ZbAVJWSNWPyNgcJmUGxsXAKRjvq2rAfefNxRyTUZji#key',
        controller: 'did:iota:58ZbAVJWSNWPyNgcJmUGxsXAKRjvq2rAfefNxRyTUZji',
        type: 'Ed25519VerificationKey2018',
        publicKeyBase58: 'EcHcUYWXEU52USiV2dyS4wWxsRDuHrawgJav3oCPzCj9'
      }
    ],
    created: '2021-03-05T08:36:54Z',
    updated: '2021-03-05T08:36:54Z',
    immutable: false,
    previous_message_id: 'WMCBCYJAARK9IODLPFAOASVZWLIJICBQXIOSVPGS9XPCUGVTRZGLIZSMJKYQMCBKHHEEWEUPOFUQA9999',
    proof: {
      type: 'JcsEd25519Signature2020',
      verificationMethod: '#key',
      signatureValue: '4dq3PDtmMuUmZY2D6sEe9mRr4SfdqPimgkf8nfETQb6rvWBaKNYhGhwrggg3XxQFj9q6wYJv98eUgJJHPK6tHesu'
    }
  },
  key: {
    type: 'ed25519',
    public: 'EcHcUYWXEU52USiV2dyS4wWxsRDuHrawgJav3oCPzCj9',
    secret: '71rm3HeVpWa1oGhqMLUmzJVsbMrDqGQfyATFPu8aMnUQ'
  },
  explorerUrl: 'https://explorer.iota.org/mainnet/transaction/WMCBCYJAARK9IODLPFAOASVZWLIJICBQXIOSVPGS9XPCUGVTRZGLIZSMJKYQMCBKHHEEWEUPOFUQA9999',
  txHash: 'WMCBCYJAARK9IODLPFAOASVZWLIJICBQXIOSVPGS9XPCUGVTRZGLIZSMJKYQMCBKHHEEWEUPOFUQA9999'
};
