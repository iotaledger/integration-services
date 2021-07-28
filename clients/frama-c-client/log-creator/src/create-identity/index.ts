import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import { logCreatorClient } from '../error/index';

import { Config, CreatorIdentity } from '../config';


export const createIdentity = async (): Promise<string | undefined> => {
	console.log('Creating the identity...');
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

	const res = await logCreatorClient.post(`${Config.baseUrl}/identities/create${apiKey}`, JSON.stringify(CreatorIdentity));

	if (res?.status === 201) {
		console.log('successfully created log-creator identity!');
		console.log('###########################');
		fs.writeFileSync('./src/config/LogCreatorIdentity.json', JSON.stringify(res.data));

		return res.data.doc.id
	}

};

