import { Config } from '../models/config.model';

export const CONFIG: Config = {
	baseUrl: process.env.BASE_URL,
	apiKey: process.env.API_KEY
};

export const DeviceIdentity = {
	username: 'construction-device-1',
	claim: {
		type: 'Device',
		category: ['sensor'],
		controlledProperty: ['electricityConsumption', 'energy'],
		controlledAsset: ['electricity-consumption-sensors', 'photovoltaics-sensors'],
		ipAddress: ['192.14.56.78'],
		mcc: '214',
		mnc: '07',
		serialNumber: '9845A',
		refDeviceModel: 'myDevice-sensor-345',
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
