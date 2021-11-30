import { CONFIG } from '../config/config';
import { csp1Client } from '../utils/client';

export const checkSubscriptionState = async (channelAddress: string, id: string) => {
	console.log('Checking subscription state...');
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';
	const interval = setInterval(async () => {
		const res = await csp1Client.get(`${CONFIG.baseUrl}/subscriptions/${channelAddress}/${id}${apiKey}`);

		if (res?.status === 200) {
			if (res.data === '') {
				await requestSubscription(channelAddress);
				console.log(`Subscription requested. Please authorize via identity id: ${id}`);
			} else if (!res.data.isAuthorized) {
				console.log(`Subscription already requested. Please authorize via identity id: ${id}`);
			} else if (res.data.isAuthorized) {
				clearInterval(interval);
				console.log('Subscription authorized!');
				console.log('--------------------------------------------------------');
				console.log('--------------------------------------------------------');
			}
		}
	}, 10000);
};

export const requestSubscription = async (channelAddress: string): Promise<string | undefined> => {
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';
	const body = {
		accessRights: 'ReadAndWrite'
	};
	console.log('Requesting subscription...');
	const res = await csp1Client.post(`${CONFIG.baseUrl}/subscriptions/request/${channelAddress}${apiKey}`, JSON.stringify(body));

	if (res?.status === 201) {
		return res.data.subscriptionLink;
	}
};
