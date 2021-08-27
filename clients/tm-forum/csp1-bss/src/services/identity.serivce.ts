import fs from 'fs';

import { CONFIG, Csp1Identity } from '../config/config';
import { csp1Client } from '../utils/client';

export const createIdentity = async (): Promise<string | undefined> => {
	console.log('--------------------------------------------------------');
	console.log('--------------------------------------------------------');
	console.log('Creating the Csp1 identity...');
	if (fs.existsSync('./src/config/Csp1Identity.json')) {
		console.log('Identity already created!');
		const identityBuffer = fs.readFileSync('./src/config/Csp1Identity.json');
		const identity = JSON.parse(identityBuffer.toString());
		return identity.doc.id;
	}
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';

	const res = await csp1Client.post(`${CONFIG.baseUrl}/identities/create${apiKey}`, JSON.stringify(Csp1Identity));

	if (res?.status === 201) {
		console.log('successfully created Csp1 identity!');
		console.log('###########################');
		const dir = './src/config/';
		if (!fs.existsSync(dir)) fs.mkdirSync(dir);
		fs.writeFileSync(`${dir}Csp1Identity.json`, JSON.stringify(res.data));

		return res.data.doc.id;
	}
};
