import * as dotenv from 'dotenv';
dotenv.config();
import { logAuditorClient } from '../error/index';

import { Config, AuditorIdentity } from '../config';
import fs from 'fs';

export const createIdentity = async (): Promise<string | undefined> => {
	console.log('Creating the log-auditor identity...');
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

	const res = await logAuditorClient.post(`${Config.baseUrl}/identities/create${apiKey}`, JSON.stringify(AuditorIdentity));

	if (res?.status === 201) {
		console.log(`successfully created log-auditor identity: ${res.data.doc.id}`);
		console.log('###########################');
		fs.writeFileSync('./src/config/LogAuditorIdentity.json', JSON.stringify(res.data));

		return res.data.doc.id;
	}
};
