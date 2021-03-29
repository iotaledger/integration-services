import { Config } from '../config';
import { getHexEncodedKey, signChallenge } from '../utils/encryption';
import axios from 'axios';

export const fetchAuth = async (identity: any) => {
	console.log('requesting challenge to sign...');

	const url = `${Config.baseUrl}/api/v1/authentication/get-challenge/${identity.doc.id}`;
	const res = await axios.get(url);
	if (res.status !== 200) {
		console.error('didnt receive status 200 on get-challenge!');
		return;
	}
	const body = await res.data;
	const challenge: string = body.challenge;
	console.log('received challenge: ', challenge);

	const encodedKey = await getHexEncodedKey(identity.key.secret);
	const signedChallenge = await signChallenge(encodedKey, challenge);
	console.log('signed challenge: ', signedChallenge);

	console.log('requesting authentication token using signed challenge...', identity.doc.id);
	const response = await axios.post(`${Config.baseUrl}/api/v1/authentication/auth/${identity.doc.id}`, JSON.stringify({ signedChallenge }), {
		method: 'post',
		headers: { 'Content-Type': 'application/json' }
	});

	return response;
};
