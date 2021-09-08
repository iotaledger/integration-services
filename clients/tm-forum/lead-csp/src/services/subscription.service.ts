import { CONFIG } from '../config/config';
import { leadCspClient } from '../utils/client';

const authorizeSubscription = async (channelAddress: string, subsciptionLink: string): Promise<void> => {
	console.log('Authorizing subscription...');
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';

	const body = {
		subscriptionLink: subsciptionLink
	};

	const res = await leadCspClient.post(`${CONFIG.baseUrl}/subscriptions/authorize/${channelAddress}${apiKey}`, JSON.stringify(body));
	if (res?.status === 200) {
		console.log('successfully authorized subscription!');
		console.log('###########################');
	}
};

export const checkSubscriptionState = async (channelAddress: string, identityId: string) => {
	console.log('Checking subscription state...');
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';

	const res = await leadCspClient.get(`${CONFIG.baseUrl}/subscriptions/${channelAddress}${apiKey}`);
	if (res.status === 200) {
		const subscriptions = res.data;
		const subscription = subscriptions.find((subscription: any) => subscription.identityId === identityId);

		if (subscription && !subscription.isAuthorized) {
			await authorizeSubscription(channelAddress, subscription.subscriptionLink);
			return true;
		} else if (!subscription) {
			console.log(`No requested subscription found for subscription link: ${subscription.subscriptionLink}`);
			return false;
		} else {
			console.log('Subscription is authorized.');
			return true;
		}
	}
};
