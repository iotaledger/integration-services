import * as dotenv from 'dotenv';
dotenv.config();

import { logAuditorClient } from '../error/index';
import { Config } from '../config';

export const requestSubscription = async (channelAddress: string): Promise<string | undefined> => {
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

	const body = {
		accessRights: 'Read'
	};

	const res = await logAuditorClient.post(`${Config.baseUrl}/subscriptions/request/${channelAddress}${apiKey}`, JSON.stringify(body));

	if (res?.status === 201) {
		console.log('successfully requested subscription!');
		console.log('###########################');
		console.log(`Subscription link: ${res.data.subscriptionLink}`);

		return res.data.subscriptionLink;
	} else {
		throw new Error('could not request the subscription');
	}
};
