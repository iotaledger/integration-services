import fs from 'fs';

import { CONFIG, LeadCspIdentity } from '../config/config';
import { leadCspClient } from '../utils/client';

export const createIdentity = async (): Promise<void> => {
	console.log('Creating the LeadCsp identity...');
	if (fs.existsSync('./src/config/LeadCspIdentity.json')) {
		return console.log(`Identity already exists.`);
	}
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';

	const res = await leadCspClient.post(`${CONFIG.baseUrl}/identities/create${apiKey}`, JSON.stringify(LeadCspIdentity));

	if (res?.status === 201) {
		console.log('successfully created LeadCsp identity!');
		console.log('###########################');
		const dir = './src/config/';
		if (!fs.existsSync(dir)) fs.mkdirSync(dir);
		fs.writeFileSync(`${dir}LeadCspIdentity.json`, JSON.stringify(res.data));
	}
};
