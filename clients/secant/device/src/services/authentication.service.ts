import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config/config';
import { getHexEncodedKey, signNonce } from '../utils/encryption';
import { axiosClient } from '../utils/client';

export const fetchAuth = async (): Promise<any> => {
	const identityPath = path.join(__dirname, '..', 'config', 'DeviceIdentity.json');
	let file, identity;
	try {
		file = fs.readFileSync(identityPath);
		identity = file && JSON.parse(file.toString());
	} catch (e) {
		console.log('error when reading file');
	}

	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';

	if ((identity as any)?.id == null) {
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
