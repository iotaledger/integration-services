import * as dotenv from 'dotenv';
dotenv.config();
import { Config } from '../config';
import axios from 'axios';
import { AxiosRequestConfig } from 'axios';
import * as fs from 'fs';
const authorBody: any = {
	username: 'summer-school-test-author',
	registrationDate: '2020-06-21T12:58:13Z',
	claim: {
		type: 'Person',
		name: 'Jon Tomson',
		familyName: 'Tomson',
		givenName: 'Jon',
		birthDate: '1980-06-21'
	}
};

const deviceBody: any = {
	username: 'summer-school-test-device',
	registrationDate: '2020-06-21T12:58:13Z',
	claim: {
		type: 'Device',
		category: ['sensor'],
		controlledProperty: ['fillingLevel', 'temperature'],
		controlledAsset: ['wastecontainer-Osuna-100'],
		ipAddress: ['192.14.56.78'],
		mcc: '214',
		mnc: '07',
		serialNumber: '9845A',
		refDeviceModel: 'myDevice-wastecontainer-sensor-345',
		dateFirstUsed: '2014-09-11T11:00:00Z'
	}
};
const axiosOptions: AxiosRequestConfig = {
	headers: {
		'Content-Type': 'application/json'
	}
};

export const createUser = async (name, body) => {
	console.log('requesting create identity endpoint...');
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';
	console.log('URL: ', `${Config.baseUrl}/identities/create${apiKey}`);

	const res = await axios.post(`${Config.baseUrl}/identities/create${apiKey}`, JSON.stringify(body), axiosOptions);
	console.log(`received status from update user endpoint: ${res?.status}`);

	if (res?.status === 201) {
		console.log('successfully created identity!');
		console.log('#### Created: ', name, '####');
		console.log('#####################');
		console.log(JSON.stringify(res.data));
		fs.writeFileSync(`./${name}.txt`, JSON.stringify(res.data), null);
		console.log('#####################');
	}
};

async function run() {
	try {
		await createUser('Author', authorBody);
		await createUser('Device', deviceBody);
	} catch (e) {
		console.log('e', e);
	}
}

run();
