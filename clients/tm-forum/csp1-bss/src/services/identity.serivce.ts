import fs from 'fs';
import path from 'path';

import { CONFIG, Csp1Identity } from '../config/config';
import { csp1Client } from '../utils/client';

export const createIdentity = async (): Promise<string | undefined> => {
	const identityPath = path.join(__dirname, '..', 'config', 'Csp1Identity.json');
	console.log('--------------------------------------------------------');
	console.log('--------------------------------------------------------');
	if (fs.existsSync(identityPath)) {
		console.log('Identity already created!');
		const identityBuffer = fs.readFileSync(identityPath);
		const identity = JSON.parse(identityBuffer.toString());
		return identity.doc.id;
	}
	console.log('Creating the Csp1 identity...');
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';

	const res = await csp1Client.post(`${CONFIG.baseUrl}/identities/create${apiKey}`, JSON.stringify(Csp1Identity));

	if (res?.status === 201) {
		console.log('successfully created Csp1 identity!');
		console.log('###########################');
		const configPath = path.join(__dirname, '..', 'config');
		if (!fs.existsSync(configPath)) fs.mkdirSync(configPath);
		fs.writeFileSync(identityPath, JSON.stringify(res.data));

		return res.data.doc.id;
	}
};
