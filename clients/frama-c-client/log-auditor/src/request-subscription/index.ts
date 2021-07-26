import axios, { AxiosRequestConfig } from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

import { errFunc } from '../error';
import { Config } from '../config';

const axiosOptions: AxiosRequestConfig = {
	headers: {
		'Content-Type': 'application/json'
	}
};

axios.interceptors.response.use((response) => response, errFunc());

export const requestSubscription = async (channelAddress: string): Promise<string | undefined> => {
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

	const body = {
		accessRights: 'Read'
	};

	const res = await axios.post(`${Config.baseUrl}/subscriptions/request/${channelAddress}${apiKey}`, JSON.stringify(body), axiosOptions);

	if (res?.status === 201) {
		console.log('successfully requested subscription!');
		console.log('###########################');
		console.log(`Subscription link: ${res.data.subscriptionLink}`);

		return res.data.subscriptionLink
	}
};

