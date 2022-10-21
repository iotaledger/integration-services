import { Config } from '../models/config.model';

export const CONFIG: Config = {
	baseUrl: process.env.BASE_URL,
	apiKey: process.env.API_KEY
};

export const DeviceIdentity = {
	username: 'ambulance-sensor-' + Math.ceil(Math.random() * 100000),
	claim: {
		type: 'Device',
		category: ['sensor'],
		controlledProperty: ['car'],
		controlledAsset: ['ambulance-log', 'patient-data'],
		ipAddress: ['192.14.56.78'],
		mcc: '214',
		mnc: '07',
		serialNumber: '9845A',
		dateFirstUsed: new Date().toISOString()
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
