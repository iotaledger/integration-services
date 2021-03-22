import { ClientIdentity, Config } from '../config';
import { getHexEncodedKey, signChallenge } from '../utils/encryption';
import axios from 'axios';

const identity = ClientIdentity;

export const fetchAuth = async () => {
	console.log('requesting challenge to sign...');

	const res = await axios.get(`${Config.baseUrl}/api/v1/authentication/get-challenge/${identity.doc.id}`);
	if (res.status !== 200) {
		console.error('didnt receive status 200 on get-challenge!');
		return;
	}
	const body = await res.data;
	const challenge: string = body.challenge;

	const encodedKey = await getHexEncodedKey(identity.key.secret);
	const signedChallenge = await signChallenge(encodedKey, challenge);

	console.log('requesting authentication token using signed challenge...', identity.doc.id);
	const response = await axios.post(`${Config.baseUrl}/api/v1/authentication/auth/${identity.doc.id}`, JSON.stringify({ signedChallenge }), {
		method: 'post',
		headers: { 'Content-Type': 'application/json' }
	});

	return response;
};
