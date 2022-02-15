import { client, setAuthHeader } from '../utils/axios-client';
import * as crypto from 'crypto';
import * as ed from '@noble/ed25519';
import bs58 from 'bs58';

export const generateNonce = async (id: any): Promise<string> => {
	const url = `${process.env.REACT_APP_E_SHOP_BACKEND_URL}/nonce/${id}`;
	const response = await client.get(url);
	return response.data.nonce;
};
// First method of authenticating via a self-signed nonce
export const authSignedNonce = async (signedNonce: string, id: string): Promise<boolean> => {
	try {
		const url = `${process.env.REACT_APP_E_SHOP_BACKEND_URL}/authenticate/${id}`;
		const response = await client.post(url, JSON.stringify({ signedNonce }));
		const jwt = response.data.jwt;
		setAuthHeader(jwt);
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
};

// Second method of authentication via a supplied secret key
export const authSecretKey = async (id: string, secretKey: string): Promise<string> => {
	const nonce = await generateNonce(id);
	const encodedKey = getHexEncodedKey(secretKey);
	return await signNonce(encodedKey, nonce);
};

const getHexEncodedKey = (base58Key: string) => {
	return bs58.decode(base58Key).toString('hex');
};

const signNonce = async (secretKey: string, nonce: string) => {
	if (nonce.length !== 40) {
		console.log('nonce does not match length of 40 characters!');
		process.exit();
	}
	const hash = crypto.createHash('sha256').update(nonce).digest().toString('hex');
	const signedHash = await ed.sign(hash, secretKey);
	return ed.Signature.fromHex(signedHash).toHex();
};
