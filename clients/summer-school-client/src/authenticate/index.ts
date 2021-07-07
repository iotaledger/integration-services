import { Config } from '../config';
import { getHexEncodedKey, signNonce } from '../utils/encryption';
import axios from 'axios';

export const fetchAuth = async (identity: any) => {
	try {
		console.log('requesting nonce to sign...');
		const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';
		const url = `${Config.baseUrl}/authentication/prove-ownership/${identity.doc.id}${apiKey}`;

		const res = await axios.get(url);
		if (res.status !== 200) {
			console.error('didnt receive status 200 on get request for prove-ownership!');
			return;
		}
		const body = await res.data;
		const nonce: string = body?.nonce;
		console.log('received nonce: ', nonce);
		if (!nonce) {
			throw new Error('no nonce received');
		}

		const encodedKey = await getHexEncodedKey(identity.key.secret);
		const signedNonce = await signNonce(encodedKey, nonce);
		console.log('signed nonce: ', signedNonce);

		console.log('requesting authentication token using signed nonce...', identity.doc.id);
		const response = await axios.post(
			`${Config.baseUrl}/authentication/prove-ownership/${identity.doc.id}${apiKey}`,
			JSON.stringify({ signedNonce }),
			{
				method: 'post',
				headers: { 'Content-Type': 'application/json' }
			}
		);

		return response;
	} catch (e) {
		console.log('error when authenticating:', e);
		throw new Error('could not authenticate');
	}
};
