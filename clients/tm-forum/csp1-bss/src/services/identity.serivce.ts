import fs from 'fs';
import path from 'path';

import { CONFIG, CreateCsp1Identity, Csp1Identity } from '../config/config';
import { csp1Client } from '../utils/client';

export const createIdentity = async (): Promise<string | undefined> => {
	if (Csp1Identity) {
		console.log('Identity already created!');
		return Csp1Identity.doc.id;
	}
	console.log('Creating the Csp1 identity...');
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';

	const res = await csp1Client.post(`${CONFIG.baseUrl}/identities/create${apiKey}`, JSON.stringify(CreateCsp1Identity));

	if (res?.status === 201) {
		console.log('successfully created Csp1 identity!');
		console.log('###########################');
		const configPath = path.join(__dirname, '..', 'config');
		const identityPath = path.join(__dirname, '..', 'config', 'Csp1Identity.json');
		if (!fs.existsSync(configPath)) fs.mkdirSync(configPath);
		fs.writeFileSync(identityPath, JSON.stringify(res.data));

		return res.data.doc.id;
	}
};
