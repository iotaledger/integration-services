import fs from 'fs';
import path from 'path';
import * as data from '../config/Csp1Identity.json';

import { CONFIG, DeviceIdentity } from '../config/config';
import { axiosClient } from '../utils/client';

export const createIdentity = async (): Promise<string | undefined> => {
	if (data) {
		console.log('Identity already created!');
		return data?.doc?.id;
	}
	console.log('Creating the device identity...');
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';

	const res = await axiosClient.post(`${CONFIG.baseUrl}/identities/create${apiKey}`, JSON.stringify(DeviceIdentity));

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
