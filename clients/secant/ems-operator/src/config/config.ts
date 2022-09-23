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
		controlledProperty: ['electricityConsumption', 'energy'],
		controlledAsset: ['phone-log', 'patient-data-hash'],
		ipAddress: ['192.14.56.78'],
		mcc: '214',
		mnc: '07',
		serialNumber: '9845A',
		refDeviceModel: 'myDevice-345',
		dateFirstUsed: new Date().toISOString(),
		owner: ['did:iota:P64uksi4B6Vg4ZEiTe3bpmzbA9EHNmeJxp1LxXtXeov']
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
