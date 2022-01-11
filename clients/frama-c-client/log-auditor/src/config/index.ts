// TODO step 2: Insert channel address
export const ChannelAddress = 'INSERT_HERE';

export const Config = {
	baseUrl: process.env.BASE_URL,
	apiKey: process.env.API_KEY
};

export const AuditorIdentity = {
	username: 'frama-c-log-auditor-' + Math.ceil(Math.random() * 100000),
	claim: {
		type: 'Service',
		name: 'Frama C Log Auditor',
		category: 'embedded-tool',
		description: 'Audits embedded logs'
	}
};
