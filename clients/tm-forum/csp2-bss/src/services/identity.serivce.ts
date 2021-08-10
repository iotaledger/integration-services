import fs from 'fs';

import { CONFIG, Csp2Identity } from '../config/config';
import { csp2Client } from '../utils/client';

export const createIdentity = async (): Promise<string | undefined> => {
	console.log('Creating the Csp2 identity...');
	if (fs.existsSync('./src/config/Csp2Identity.json')) {
		const identityBuffer = fs.readFileSync('./src/config/Csp2Identity.json');
		const identity = JSON.parse(identityBuffer.toString());
		return identity.doc.id;
	}
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';

	const res = await csp2Client.post(`${CONFIG.baseUrl}/identities/create${apiKey}`, JSON.stringify(Csp2Identity));

	if (res?.status === 201) {
		console.log('successfully created Csp2 identity!');
		console.log('###########################');
		const dir = './src/config/';
		if (!fs.existsSync(dir)) fs.mkdirSync(dir);
		fs.writeFileSync(`${dir}Csp2Identity.json`, JSON.stringify(res.data));

		return res.data.doc.id;
	}
};
