import * as dotenv from 'dotenv';
dotenv.config();
import axios, { AxiosRequestConfig } from 'axios';

import { Config, AuditorIdentity } from '../config';
import fs from 'fs';

const axiosOptions: AxiosRequestConfig = {
	headers: {
		'Content-Type': 'application/json'
	}
};

const createIdentity = async () => {
	console.log('Creating the identity...');
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

	const res = await axios.post(`${Config.baseUrl}/identities/create${apiKey}`, JSON.stringify(AuditorIdentity), axiosOptions);

	if (res?.status === 201) {
		console.log(`successfully created identity: ${res.data.doc.id}`);
		console.log('###########################');
		fs.writeFileSync('./src/config/LogAuditorIdentity.json', JSON.stringify(res.data));
	}
};

const run = () => {
	createIdentity();
};

run();
