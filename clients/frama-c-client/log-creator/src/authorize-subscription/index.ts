import * as dotenv from 'dotenv';
dotenv.config();
import axios, { AxiosRequestConfig } from 'axios';

import { Config } from '../config';
import { errFunc } from '../error';

const axiosOptions: AxiosRequestConfig = {
	headers: {
		'Content-Type': 'application/json'
	}
};

axios.interceptors.response.use((response) => response, errFunc());

export const authorizeSubscription = async (channelAddress: string, subsciptionLink: string): Promise<void> => {
	console.log('Authorizing subscription...');
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

	const body = {
		subscriptionLink: subsciptionLink
	};

	const res = await axios.post(`${Config.baseUrl}/subscriptions/authorize/${channelAddress}${apiKey}`, JSON.stringify(body), axiosOptions);

	if (res?.status === 200) {
		console.log('successfully authorized subscription!');
		console.log('###########################');
	}
};


