import { Config } from '../models/config.model';

export const CONFIG: Config = {
	baseUrl: process.env.BASE_URL,
	apiKey: process.env.API_KEY,
	port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
	tmf622Verion: process.env.TMF622_VERSION,
	tmf641Verion: process.env.TMF641_VERSION,
	tmf623Verion: process.env.TMF623_VERSION,
	mavenirApi: process.env.MAVENIR_API
};

export const Csp1Identity = {
	username: 'Csp1Identity',
	claim: {
		type: 'Service',
		name: 'TMForum Csp1Identity',
		category: 'proxy',
		description: 'proxies requests to TMForum API'
	}
};

const serviceOrderItem = [
	{
		id: '1',
		action: 'add',
		service: {
			name: 'Broadband Gold',
			state: 'inactive',
			serviceCharacteristic: [
				{
					name: 'CSI Info',
					valueType: 'CsiInfo',
					value: {
						sST: 1,
						nEST: {
							dLThptPerUE: {
								guaThpt: 192,
								maxThpt: 50000
							},
							uLThptPerUE: {
								guaThpt: 192,
								maxThpt: 5000
							},
							maxNumberofUEs: '10',
							isolationLevel: {
								level: ['NO ISOLATION']
							},
							mMTelSupport: '1',
							sessServContSupport: '1',
							sliceQoSParams: ['1', '2', '5', '6', '7', '8', '9'],
							userDataAccess: '0'
						}
					}
				}
			]
		}
	}
];

export const ServiceOrderCreate = {
	externalId: '1',
	description: 'Communication Service 1',
	serviceOrderItem
};

export const ProductOrder = {
	id: '1',
	productOrderItem: [
		{
			id: '1',
			action: 'add'
		}
	]
};

export const ServiceOrder = {
	id: '1',
	externalId: '1',
	description: 'Communication Service 1',
	serviceOrderItem
};

export const getChannelAddress = () => {
	const channelAddress = process.env.CHANNEL_ADDRESS;
	if (channelAddress === '<INSERT_CHANNEL_ADDRESS>' || !channelAddress) {
		console.error('Please create channel and insert channel address in .env !');
		process.exit();
	}
	return channelAddress;
};
