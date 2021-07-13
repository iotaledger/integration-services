import * as dotenv from 'dotenv';
dotenv.config();
import axios, { AxiosRequestConfig } from 'axios';
import fs from 'fs';

import { Config, SubscriptionLink } from '../config';
import { errFunc } from '../error';

const axiosOptions: AxiosRequestConfig = {
	headers: {
		'Content-Type': 'application/json'
	}
};

axios.interceptors.response.use((response) => response, errFunc());

const authorizeSubscription = async (channelAddress: string, subsciptionLink: string) => {
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

const run = () => {
	const channelBuffer = fs.readFileSync('./src/config/Channel.json');
	const channel = JSON.parse(channelBuffer.toString());
	const channelAddress = channel.channelAddress;
	const subsciptionLink = SubscriptionLink;
	authorizeSubscription(channelAddress, subsciptionLink);
};

run();
