import * as dotenv from 'dotenv';
dotenv.config();
import { Config } from '../config';
import axios from 'axios';
import { AxiosRequestConfig } from 'axios';
import { errFunc } from '../error';

const axiosOptions: AxiosRequestConfig = {
	headers: {
		'Content-Type': 'application/json'
	}
};

const subscriberIdentity = ''; // TODO set this subscriber identity
const channelAddress = ''; // TODO set this channel address

axios.interceptors.response.use((response) => response, errFunc(subscriberIdentity));

export const createChannel = async (subscriberIdentity, channelAddress) => {
	if (!subscriberIdentity) {
		throw new Error('no subscriber defined!');
	}
	const body = {
		topics: [{ type: 'smart-audit-log', source: 'devices and user' }],
		encrypted: false
	};
	console.log('creating channel for identity:', subscriberIdentity);
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';
	const res = await axios.post(`${Config.baseUrl}/channels/request/${channelAddress}${apiKey}`, JSON.stringify(body), axiosOptions);
	console.log(`received status from create channel endpoint: ${res?.status}`);

	if (res?.status === 201) {
		console.log('#### Successfully created the channel! ####');
		console.log('###########################################');
		console.log('###########################################');
		console.log(res.data);
		console.log('###########################################');
		console.log('###########################################');
	}
};

async function run() {
	try {
		await createChannel(subscriberIdentity, channelAddress);
	} catch (e) {
		console.log('e', e);
	}
}

run();
