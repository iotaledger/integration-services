import { Config } from '../models/config.model';

export const CONFIG: Config = {
	baseUrl: process.env.BASE_URL,
	csp1Url: process.env.CSP1_URL,
	apiKey: process.env.API_KEY
};

export const LeadCspIdentity = {
	username: 'LeadCspIdentity-' + Math.ceil(Math.random() * 100000),
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
export const getIdentityId = (): string => {
	const csp1IdentityId = process.env.CSP1_IDENTITY_ID;
	if (csp1IdentityId === '<INSERT_CSP1_IDENTITY_ID>' || !csp1IdentityId) {
		console.error('Please insert csp1 identity id in .env !');
		process.exit();
	}
	return csp1IdentityId;
};
