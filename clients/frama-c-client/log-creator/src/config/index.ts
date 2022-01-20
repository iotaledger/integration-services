// TODO step 4: Insert subscrption link
export const SubscriptionLink = 'INSERT_HERE';

export const Config = {
	baseUrl: process.env.BASE_URL,
	apiKey: process.env.API_KEY
};

export const CreatorIdentity = {
	username: 'frama-c-log-creator-' + Math.ceil(Math.random() * 100000),
	claim: {
		type: 'Service',
		name: 'Frama C Log Creator',
		category: 'embedded-tool',
		description: 'Creates embedded logs'
	}
};

export const ChannelConfig = {
	topics: [{ type: 'hashed-audit-log-file', source: 'frama-c-client' }]
};
