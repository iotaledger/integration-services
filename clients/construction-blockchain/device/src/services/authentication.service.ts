import { CONFIG } from '../config/config';
import { getHexEncodedKey, signNonce } from '../utils/encryption';
import { axiosClient } from '../utils/client';
import * as identity from '../config/Csp1Identity.json';

export const fetchAuth = async (): Promise<any> => {
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';

	if (!identity?.doc.id) {
		throw new Error('no identity found');
	}

	const res = await axiosClient.get(`${CONFIG.baseUrl}/authentication/prove-ownership/${identity.doc.id}${apiKey}`);
	if (res.status !== 200) {
		console.error('Didnt receive status 200 on get request for prove-ownership!');
		return;
	}
	const body = await res.data;
	const nonce: string = body.nonce;

	const encodedKey = await getHexEncodedKey(identity.key.secret);
	const signedNonce = await signNonce(encodedKey, nonce);
	const response = await axiosClient.post(
		`${CONFIG.baseUrl}/authentication/prove-ownership/${identity.doc.id}${apiKey}`,
		JSON.stringify({ signedNonce }),
		{
			method: 'post',
			headers: { 'Content-Type': 'application/json' }
		}
	);
	if (response?.status === 200) {
		console.log('Successfully authenticated!');
	}

	return response;
};
