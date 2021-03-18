import fetch from 'node-fetch';
import { ClientIdentity, Config } from '../config';
import { getHexEncodedKey, signChallenge } from '../utils/encryption';

const identity = ClientIdentity;

export const fetchAuth = async () => {
  console.log('requesting challenge to sign...');

  const res = await fetch(`${Config.baseUrl}/api/v1/authentication/get-challenge/${identity.doc.id}`);
  if (res.status !== 200) {
    console.error('didnt receive status 200 on get-challenge!');
    return;
  }
  const body = await res.json();
  const challenge: string = body.challenge;

  const encodedKey = await getHexEncodedKey(identity.key.secret);
  const signedChallenge = await signChallenge(encodedKey, challenge);

  console.log('requesting authentication token using signed challenge...');
  const response = await fetch(`${Config.baseUrl}/api/v1/authentication/auth/${identity.doc.id}`, {
    method: 'post',
    body: JSON.stringify({ signedChallenge }),
    headers: { 'Content-Type': 'application/json' }
  });

  return response;
};
