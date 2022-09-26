import { Config } from '../models/config.model';

export const CONFIG: Config = {
	baseUrl: process.env.BASE_URL,
	apiKey: process.env.API_KEY
};

export const ChannelConfig = {
	name: 'patient-logs-' + Math.ceil(Math.random() * 100000),
	topics: [{ type: 'ems-operator-channel', source: 'frama-c-client' }]
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
export const DeviceIdentity = {
	username: 'ems-operator-laptop' + Math.ceil(Math.random() * 100000),
	claim: {
		type: 'Device',
		category: ['sensor'],
		controlledProperty: [''],
		controlledAsset: ['ambulance-log', 'patient-data-hash'],
		ipAddress: ['192.14.56.78'],
		mcc: '214',
		mnc: '07',
		serialNumber: '9845A',
		dateFirstUsed: new Date().toISOString()
	}
};
