import axios from 'axios';
import fs from 'fs';
import { Config } from '../config';
import { getHexEncodedKey, signNonce } from '../utils/encryption';

export const fetchAuth = async (): Promise<any> => {
	const identityBuffer = fs.readFileSync('./src/config/LogAuditorIdentity.json');
	const identity = JSON.parse(identityBuffer.toString());
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';
	const url = `${Config.baseUrl}/authentication/prove-ownership/${identity.doc.id}${apiKey}`;

	const res = await axios.get(url);
	if (res.status !== 200) {
		console.error('didnt receive status 200 on get request for prove-ownership!');
		return;
	}
	const body = await res.data;
	const nonce: string = body.nonce;

	const encodedKey = await getHexEncodedKey(identity.key.secret);
	const signedNonce = await signNonce(encodedKey, nonce);

	const response = await axios.post(`${Config.baseUrl}/authentication/prove-ownership/${identity.doc.id}${apiKey}`, JSON.stringify({ signedNonce }), {
		method: 'post',
		headers: { 'Content-Type': 'application/json' }
	});
	if (response?.status === 200) {
		console.log('successfully authenticated!');
	}

	return response;
};
