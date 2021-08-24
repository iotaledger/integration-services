import { CONFIG } from "../config/config";
import { csp2Client } from "../utils/client";

export const checkSubscriptionState = async (channelAddress: string, identityId: string) => {
	console.log('Checking subscription state...');
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';

	const res = await csp2Client.get(`${CONFIG.baseUrl}/subscriptions/${channelAddress}/${identityId}${apiKey}`);

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

export const requestSubscription = async (channelAddress: string) => {
	try {
		const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';
		const body = {
			accessRights: 'ReadAndWrite'
		};
		console.log('Requesting subscription...');
		const res = await csp2Client.post(`${CONFIG.baseUrl}/subscriptions/request/${channelAddress}${apiKey}`, JSON.stringify(body));
		if (res?.status === 201) {
			console.log('Successfully requested subscription, authorize subscription to write violations to the channel!');
			console.log('###########################');
			console.log(`Subscription link: ${res.data.subscriptionLink}`);
			process.exit();
		}
	} catch (error) {
		console.log(error.response.data);
	}
};