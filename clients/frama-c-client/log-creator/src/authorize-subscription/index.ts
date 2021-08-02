import * as dotenv from 'dotenv';
dotenv.config();

import { Config } from '../config';
import { logCreatorClient } from '../error/index';

export const authorizeSubscription = async (channelAddress: string, subsciptionLink: string): Promise<void> => {
	console.log('Authorizing subscription...');
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

	const body = {
		subscriptionLink: subsciptionLink
	};

	const res = await logCreatorClient.post(`${Config.baseUrl}/subscriptions/authorize/${channelAddress}${apiKey}`, JSON.stringify(body));

	if (res?.status === 200) {
		console.log('successfully authorized subscription!');
		console.log('###########################');
	}
};
