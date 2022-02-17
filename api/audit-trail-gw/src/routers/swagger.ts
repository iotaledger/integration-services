import { ConfigurationService } from '../services/configuration-service';
import { Logger } from '@iota/is-shared-modules/lib/utils/logger/index';

const { apiVersion } = ConfigurationService.getInstance(Logger.getInstance()).config;

export const openApiDefinition = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Audit Trail GW API Documentation',
			version: apiVersion,
			description: `This is the API documentation for the Audit Trail Gateway of the [Integration Services](https://github.com/iotaledger/integration-services). For further information have a look at our [Wiki](https://wiki.iota.org/integration-services/services/audit-trail-gateway/introduction).`
		},
		tags: [
			{
				name: 'channel-info',
				description: 'Get information about a channel '
			},
			{
				name: 'channels',
				description: 'Create, read from, write to channels'
			},
			{
				name: 'subscriptions',
				description: 'Manage and authorize subscriptions'
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
