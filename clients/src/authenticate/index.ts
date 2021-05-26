import { Config } from '../config';
import { getHexEncodedKey, signNonce } from '../utils/encryption';
import axios from 'axios';

export const fetchAuth = async (identity: any) => {
	console.log('requesting nonce to sign...');

	const url = `${Config.baseUrl}/api/v1/authentication/prove-ownership/${identity.doc.id}`;
	const res = await axios.get(url);
	if (res.status !== 200) {
		console.error('didnt receive status 200 on get request for prove-ownership!');
		return;
	}
	const body = await res.data;
	const nonce: string = body.nonce;
	console.log('received nonce: ', nonce);

	const encodedKey = await getHexEncodedKey(identity.key.secret);
	const signedNonce = await signNonce(encodedKey, nonce);
	console.log('signed nonce: ', signedNonce);

	console.log('requesting authentication token using signed nonce...', identity.doc.id);
	const response = await axios.post(`${Config.baseUrl}/api/v1/authentication/prove-ownership/${identity.doc.id}`, JSON.stringify({ signedNonce }), {
		method: 'post',
		headers: { 'Content-Type': 'application/json' }
	});

	return response;
};
