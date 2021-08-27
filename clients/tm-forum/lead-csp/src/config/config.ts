import { Config } from '../models/config.model';

export const CONFIG: Config = {
	baseUrl: process.env.BASE_URL,
	csp1Url: process.env.CSP1_URL,
	apiKey: process.env.API_KEY
};

export const LeadCspIdentity = {
	username: 'LeadCspIdentity',
	claim: {
		type: 'Service',
		name: 'TMForum LeadCspIdentity',
		category: 'Send product order',
		description: 'writes product orders to csp1'
	}
};

export const ChannelConfig = {
	topics: [{ type: 'tm-forum', source: 'lead-csp' }],
	hasPresharedKey: true
};

export const ProductOrderCreate = {
	externalId: 'CS001',
	productOrderItem: [
		{
			id: '1',
			action: 'add'
		}
	]
};

export const getSubscriptionLinks = (): { csp1SubscriptionLink: string; csp2SubscriptionLink: string } => {
	const csp1SubscriptionLink = process.env.CSP1_SUBSCRIPTION_LINK;
	const csp2SubscriptionLink = process.env.CSP2_SUBSCRIPTION_LINK;
	if (
		csp1SubscriptionLink === '<INSERT_CSP1_SUBSCRIPTION_LINK>' ||
		csp2SubscriptionLink === '<INSERT_CSP2_SUBSCRIPTION_LINK>' ||
		!csp1SubscriptionLink ||
		!csp2SubscriptionLink
	) {
		console.error('Please insert csp1 and csp2 subscription links in .env !');
		process.exit();
	}
	return { csp1SubscriptionLink, csp2SubscriptionLink };
};
