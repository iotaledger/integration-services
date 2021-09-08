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
export const getSubscriptionLink = (): string => {
	const csp1SubscriptionLink = process.env.CSP1_SUBSCRIPTION_LINK;
	if (csp1SubscriptionLink === '<INSERT_CSP1_SUBSCRIPTION_LINK>' || !csp1SubscriptionLink) {
		console.error('Please insert csp1 subscription link in .env !');
		process.exit();
	}
	return csp1SubscriptionLink;
};
