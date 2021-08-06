import { CONFIG } from '../config/config';
import { csp1Client } from '../utils/client';

export const checkSubscriptionState = async (channelAddress: string, identityId: string) => {
	console.log('Checking subscription state...');
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';

	const res = await csp1Client.get(`${CONFIG.baseUrl}/subscriptions/${channelAddress}/${identityId}${apiKey}`);

	if (res?.status === 200) {
		if (res.data === '') {
			const subscriptionLink = await requestSubscription(channelAddress);
			console.log(`Subscription requested. Please authorize subscription link: ${subscriptionLink}`);
			process.exit();
		}
		if (!res.data.isAuthorized) {
			console.log(`Subscription already requested. Please authorize subscription link: ${res.data.subscriptionLink}`);
			process.exit();
		}
		console.log('Subscription authorized!');
	}
};

export const requestSubscription = async (channelAddress: string): Promise<string | undefined> => {
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';

	const body = {
		accessRights: 'ReadAndWrite'
	};

	const res = await csp1Client.post(`${CONFIG.baseUrl}/subscriptions/request/${channelAddress}${apiKey}`, JSON.stringify(body));

	if (res?.status === 201) {
		console.log('successfully requested subscription!');
		console.log('###########################');

		return res.data.subscriptionLink;
	} else {
		throw new Error('could not request the subscription');
	}
};
