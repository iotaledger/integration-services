import fs from 'fs';
import { CONFIG } from '../config/config';
import { getHexEncodedKey, signNonce } from '../utils/encryption';
import { csp1Client } from '../utils/client';

export const fetchAuth = async (): Promise<any> => {
	const identityBuffer = fs.readFileSync('./src/config/Csp1Identity.json');
	const identity = JSON.parse(identityBuffer.toString());
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';

	const res = await csp1Client.get(`${CONFIG.baseUrl}/authentication/prove-ownership/${identity.doc.id}${apiKey}`);
	if (res.status !== 200) {
		console.error('didnt receive status 200 on get request for prove-ownership!');
		return;
	}
	const body = await res.data;
	const nonce: string = body.nonce;

	const encodedKey = await getHexEncodedKey(identity.key.secret);
	const signedNonce = await signNonce(encodedKey, nonce);
	const response = await csp1Client.post(
		`${CONFIG.baseUrl}/authentication/prove-ownership/${identity.doc.id}${apiKey}`,
		JSON.stringify({ signedNonce }),
		{
			method: 'post',
			headers: { 'Content-Type': 'application/json' }
		}
	);
	if (response?.status === 200) {
		console.log('successfully authenticated!');
		// console.log('JWT: ', response.data.jwt);
	}

	return response;
};
