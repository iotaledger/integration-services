import { Config } from '../models/config.model';

export const CONFIG: Config = {
	baseUrl: process.env.BASE_URL,
	apiKey: process.env.API_KEY
};

export const ChannelConfig = {
	name: 'patient-logs-' + Math.ceil(Math.random() * 100000),
	topics: [
		{ type: 'operationUpdate', source: 'ems-device' },
		{ type: 'ambulanceUpdate', source: 'ambulance-device' }
	],
	description: 'Logs of the incident.'
};

export const EmsOperatorIdentity = {
	username: 'ems-operator' + Math.ceil(Math.random() * 100000),
	claim: {
		type: 'Person',
		name: 'Peter Peters',
		familyName: 'Peters',
		givenName: 'Peter',
		jobTitle: 'Doctor'
	}
};
