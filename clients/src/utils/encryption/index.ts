import * as crypto from 'crypto';
import * as ed from 'noble-ed25519';
import * as bs58 from 'bs58';

export const createChallenge = (): string => {
  const challenge = crypto.randomBytes(30).toString('hex');
  return crypto.createHash('sha256').update(challenge).digest().toString();
};

export const getHexEncodedKey = (base58Key: string) => {
  return bs58.decode(base58Key).toString('hex');
};

export const signChallenge = async (privateKey: string, challenge: string) => {
  return await ed.sign(challenge, privateKey);
};

export const verifiyChallenge = async (publicKey: string, challenge: string, signature: string) => {
  return await ed.verify(signature, challenge, publicKey);
};
