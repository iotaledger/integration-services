import { CONFIG } from '../config/config';
import { axiosClient } from '../utils/client';

export const checkSubscriptionState = async (channelAddress: string, identityId: string) => {
	console.log('Checking subscription state...');
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';
	const res = await axiosClient.get(`${CONFIG.baseUrl}/subscriptions/${channelAddress}/${identityId}${apiKey}`);

	if (res?.status === 200) {
		if (res.data === '') {
			await requestSubscription(channelAddress);
			console.log(`Subscription requested. Please authorize via identity id: ${identityId}`);
			process.exit();
		} else if (!res.data.isAuthorized) {
			console.log(`Subscription already requested. Please authorize via identity id: ${identityId}`);
			process.exit();
		} else if (res.data.isAuthorized) {
			console.log('Subscription authorized!');
			console.log('--------------------------------------------------------');
			console.log('--------------------------------------------------------');
		}
	}
};

export const requestSubscription = async (channelAddress: string): Promise<string | undefined> => {
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';
	const body = {
		accessRights: 'ReadAndWrite'
	};
	console.log('Requesting subscription...');
	const res = await axiosClient.post(`${CONFIG.baseUrl}/subscriptions/request/${channelAddress}${apiKey}`, JSON.stringify(body));

	if (res?.status === 201) {
		return res.data.subscriptionLink;
	}
};
