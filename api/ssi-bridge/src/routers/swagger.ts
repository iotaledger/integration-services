import { ConfigurationService } from '../services/configuration-service';
import { Logger } from '../utils/logger/index';

const { apiVersion } = ConfigurationService.getInstance(Logger.getInstance()).config;

export const openApiDefinition = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'SSI Bridge API Documentation',
			version: apiVersion,
			description: `This is the API documentation for the SSI Bridge of the [Integration Services](https://github.com/iotaledger/integration-services). For further information have a look at our [Wiki](https://wiki.iota.org/integration-services/services/ssi-bridge/introduction).`
		},
		tags: [
			{
				name: 'identities',
				description: 'Manage decentralized identities'
			},
			{
				name: 'authentication',
				description: 'Authenticate and authorize identities to the Bridge'
			},
			{
				name: 'verification',
				description: 'Create and verifiy credentials'
			},
			{
				name: 'server-info',
				description: 'Get information about the server'
			}
		],
		servers: [
			{
				url: `/api/${apiVersion}`,
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
