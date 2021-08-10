import { Config } from '../models/config.model';

export const CONFIG: Config = {
	baseUrl: process.env.BASE_URL,
	apiKey: process.env.API_KEY
};

export const Csp2Identity = {
	username: 'Csp2Identity',
	claim: {
		type: 'Service',
		name: 'TMForum Csp2Identity',
		category: 'sla violation writer',
		description: 'writes sla violations'
	}
};

export const SlaViolation = {
	id: 'test-violation',
	href: 'test-ref'
};

export const getChannelAddress = () => {
	const channelAddress = process.env.CHANNEL_ADDRESS;
	if (channelAddress === '<INSERT_CHANNEL_ADDRESS>' || !channelAddress) {
		console.error('Please create channel and insert channel address in .env !');
		process.exit();
	}
	return channelAddress;
};
