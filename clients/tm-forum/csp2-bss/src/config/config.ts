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
	id: '37b8596c-6b36-938c-ecb7-f23c5b03f3f5',
	sla: {
		href: 'https://www.example.com/tmf-api/slaManagement/v1/sla/123444',
		description: 'High Speed Data SLA'
	},
	relatedParty: {
		id: '2802',
		href: 'https://www.example.com/tmf-api/partyManagement/v1/party/2802',
		name: 'NNNN',
		role: 'SLAConsumer'
	},
	violation: {
		rule: {
			href: 'https://www.example.com/tmf-api/slaManagement/v1/sla/123444/rules/availability',
			description: 'Availability rule'
		},
		unit: 'string',
		referenceValue: 'availability',
		operator: '.ge',
		actualValue: 'availability',
		tolerance: '0.5',
		violationAverage: '0.1',
		comment: 'Comment',
		consequence: 'http://www.example.com/contract/clause/42',
		attachment: {
			href: 'http://foo.bar/screenshot.552',
			description: 'screenshot'
		}
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
