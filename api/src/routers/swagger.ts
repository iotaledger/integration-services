import { CONFIG } from '../config';

export const openApiDefinition = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'E-Commerce Tools API Documentation',
			version: '1.0.0',
			description: `This is the API documentation for the ENSURESEC E-Commerce Tools. Have a look at the repository for examples at [Github](https://github.com/iotaledger/e-commerce-tools).
            For further information on the Audit Trail GW API have a look at [Audit Trail API](https://github.com/iotaledger/e-commerce-tools/blob/master/api/usage-audit-trail-GW.md) and head to
            [SSI Bridge](https://github.com/iotaledger/e-commerce-tools/blob/master/api/usage-ssi-bridge.md) for information about the SSI Bridge.
            `
		},
		tags: [
			{
				name: 'authentication',
				description: 'Authenticate and authorize identities to the Bridge'
			},
			{
				name: 'channel-info',
				description: 'Get information about a channel '
			},
			{
				name: 'channels',
				description: 'Create, read from, write to channels'
			},
			{
				name: 'identity',
				description: 'Manage decentralized identities'
			},
			{
				name: 'subscriptions',
				description: 'Manage and authorize subscriptions'
			},
			{
				name: 'verification',
				description: 'Create and verifiy credentials'
			}
		],
		servers: [
			{
				url: `/api/${CONFIG.apiVersion}`,
				description: 'Local Dev'
			},
			{
				url: `https://ensuresec.solutions.iota.org/api/v0.1`,
				description: 'Deployed Dev'
			}
		],
		components: {
			securitySchemes: {
				BearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT'
				},
				ApiKey: {
					type: 'apiKey',
					in: 'query',
					name: 'api-key'
				}
			}
		},
		security: [
			{
				ApiKey: [] as any[]
			}
		]
	},
	apis: ['./src/routers/**/*.ts', './src/models/open-api-schema.yaml'] // files containing annotations as above
};
