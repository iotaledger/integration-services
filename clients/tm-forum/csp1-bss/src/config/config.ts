import { Config } from '../models/config.model';

export const CONFIG: Config = {
	baseUrl: process.env.BASE_URL,
	apiKey: process.env.API_KEY,
	tmf622Version: process.env.TMF622_VERSION,
	tmf641Version: process.env.TMF641_VERSION,
	tmf623Version: process.env.TMF623_VERSION,
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

export const ViolationRules = {
    "name": "High Speed Data SLA",
    "description": "SLA for high speed data",
    "version": "0.1",
    "validityPeriod": {
        "startTime": "2021-08-03T12:02:31.297Z",
        "endTime": "2021-08-03T12:02:31.297Z"
    },
    "template": {
        "id": "9022",
        "href": "http://www.example.com/tmf-api/slaManagement/v1/slaTemplate/9022",
        "name": "DataSLATemplate",
        "description": "Description for Data SLA template"
    },
    "relatedParty": [
        {
            "id": "2802",
            "href": "http://www.example.com/tmf-api/partyManagement/v1/party/2802",
            "name": "NNNN",
            "role": "SLAConsumer"
        }
    ],
    "approved": true,
    "rule": [
        {
            "id": "availability",
            "metric": "number",
            "unit": "number",
            "referenceValue": "availability",
            "operator": ".ge",
            "tolerance": "0.5",
            "consequence": "http://www.example.com/contract/clause/722"
        }
    ]
}

export const SlaViolation = {
	id: "37b8596c-6b36-938c-ecb7-f23c5b03f3f5",
	sla: {
		href: "https://www.example.com/tmf-api/slaManagement/v1/sla/123444",
		description: "High Speed Data SLA"
	},
	relatedParty: {
		id: "2802",
		href: "https://www.example.com/tmf-api/partyManagement/v1/party/2802",
		name: "NNNN",
		role: "SLAConsumer"
	},
	violation: {
		rule: {
			href: "https://www.example.com/tmf-api/slaManagement/v1/sla/123444/rules/availability",
			description: "Availability rule"
		},
		unit: "string",
		referenceValue: "availability",
		operator: ".ge",
		actualValue: "availability",
		tolerance: "0.5",
		violationAverage: "0.1",
		comment: "Comment",
		consequence: "http://www.example.com/contract/clause/42",
		attachment: {
			href: "http://foo.bar/screenshot.552",
			description: "screenshot"
		}
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
