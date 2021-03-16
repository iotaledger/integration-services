import fetch from 'node-fetch';
import { Config } from '../config';
import { getHexEncodedKey, signChallenge } from '../utils/encryption';

// returned from localhost:3000/api/v1/authentication/create-identity!
const identity = {
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

export const fetchAuth = async () => {
  const res = await fetch(`${Config.baseUrl}/api/v1/authentication/get-challenge/${identity.doc.id}`);
  if (res.status !== 200) {
    console.log('didnt receive status 200 on get-challenge!');
    return;
  }
  const body = await res.json();
  const challenge: string = body.challenge;
  console.log('challenge', challenge);

  const encodedKey = await getHexEncodedKey(identity.key.secret);
  const signedChallenge = await signChallenge(encodedKey, challenge);
  console.log('signed', signedChallenge);

  const response = await fetch(`${Config.baseUrl}/api/v1/authentication/auth/${identity.doc.id}`, {
    method: 'post',
    body: JSON.stringify({ signedChallenge }),
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.status === 200) {
    console.log('response', await response.json());
  } else {
    console.log('didnt receive status 200 on auth!');
  }
};
