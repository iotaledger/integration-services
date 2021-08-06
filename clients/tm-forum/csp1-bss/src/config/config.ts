import { Config } from '../models/config.model';

export const CONFIG: Config = {
	baseUrl: process.env.BASE_URL,
	apiKey: process.env.API_KEY,
	port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
	apiVersion: process.env.API_VERSION,
	mavenirApi: process.env.MAVENIR_API
};

export const Csp1Identity = {
	username: 'Csp1Identity',
	claim: {
		type: 'Service',
		name: 'TMForum Csp1Identity',
		category: 'proxy',
		description: 'proxies requests to TMForum API',
	}
};

export const getChannelAddress = () => {
	const channelAddress = process.env.CHANNEL_ADDRESS;
	if (channelAddress === '<INSERT_CHANNEL_ADDRESS>' || !channelAddress) {
		console.error('Please create channel and insert channel address in .env !');
		process.exit();
	}
	return channelAddress;
};

