import * as dotenv from 'dotenv';
dotenv.config();
import { Config } from '../config';
import axios, { AxiosRequestConfig } from 'axios';
import * as fs from 'fs';

// TODO 1.1 add your details here
const studentBody = {
	username: 'summer-school-student',
	claim: {
		type: 'Person',
		name: 'Jon Tomson',
		familyName: 'Tomson',
		givenName: 'Jon',
		birthDate: '1980-06-21'
	}
};

const axiosOptions: AxiosRequestConfig = {
	headers: {
		'Content-Type': 'application/json'
	}
};

export const createUser = async (name, body) => {
	console.log('Creating the identity...');
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

	const res = await axios.post(`${Config.baseUrl}/identities/create${apiKey}`, JSON.stringify(body), axiosOptions);

	if (res?.status === 201) {
		console.log('successfully created identity!');
		console.log('#### Created: ', name, '####');
		console.log('###########################');
		console.log(JSON.stringify(res.data));
		fs.writeFileSync(`./src/create-identity/${name}.json`, JSON.stringify(res.data), null);
		console.log('###########################');
	}
};

async function run() {
	try {
		await createUser('Student', studentBody);
	} catch (e) {
		console.log(e);
	}
}

run();
