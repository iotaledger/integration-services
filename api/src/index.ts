import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import swaggerUi from "swagger-ui-express";
import { errorMiddleware } from './middlewares/error';
import { authenticationRouter, verificationRouter, channelInfoRouter, channelRouter, subscriptionRouter, identityRouter } from './routers';
import { MongoDbService } from './services/mongodb-service';
import { CONFIG } from './config';
import morgan from 'morgan';
import { setupApi } from './setup';
import swaggerJsdoc from 'swagger-jsdoc';
import { Logger } from './utils/logger';

const logger = Logger.getInstance();

function useRouter(app: express.Express, prefix: string, router: express.Router) {
	const messages = router.stack.map((r) => `${Object.keys(r?.route?.methods)?.[0].toUpperCase()}  ${prefix}${r?.route?.path}`);
	messages.map((m) => logger.log(m));

	app.use(prefix, router);
}


async function startServer() {
	// setup did for server if not exists
	await setupApi();

	const app = express();
	const port = CONFIG.port;
	const dbUrl = CONFIG.databaseUrl;
	const dbName = CONFIG.databaseName;
	const version = CONFIG.apiVersion;
	const loggerMiddleware = morgan('combined');

	const options = {
		definition: {
			openapi: '3.0.0',
			info: {
				title: 'E-Commerce Tools API Documentation',
				version: '1.0.0',
				description: `This is the API documentation for the ENSURESEC E-Commerce Tools. Have a look at the repository for examples at [Github](https://github.com/iotaledger/e-commerce-tools).
				For further information on the Audit Trail GW API have a look at [Audit Trail API](https://github.com/iotaledger/e-commerce-tools/blob/master/api/usage-audit-trail-GW.md) and head to
				[SSI Bridge](https://github.com/iotaledger/e-commerce-tools/blob/master/api/usage-ssi-bridge.md) for information about the SSI Bridge.
				`,
			},
			tags: [
				{
					"name": "authentication",
					"description": "Authenticate and authorize identities to the Bridge",
				},
				{
					"name": "channel-info",
					"description": "Get information about a channel ",
				},
				{
					"name": "channels",
					"description": "Create, read from, write to channels",
				},
				{
					"name": "identity",
					"description": "Manage decentralized identities",
				},
				{
					"name": "subscriptions",
					"description": "Manage and authorize subscriptions",
				}
				,
				{
					"name": "verification",
					"description": "Create and verifiy credentials",
				}
			],
			servers: [
				{
					"url": `/api/${version}`,
					"description": "Local Dev"
				}
			],
			components: {
				securitySchemes: {
					BearerAuth: {
						type: 'http',
						scheme: 'bearer',
						bearerFormat: 'JWT'
					}
				}
				
			}
		},
		apis: ['./src/routers/**/*.ts', './src/models/open-api-schema.yaml'], // files containing annotations as above
	};

	const swaggerUiOptions = {
		explorer: true
	}

	const openapiSpecification = swaggerJsdoc(options);

	app.use(express.json({ limit: '10mb' }));
	app.use(express.urlencoded({ limit: '10mb', extended: true }));
	app.use(loggerMiddleware);
	app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification, swaggerUiOptions));

	const prefix = `/api/${version}`;
	useRouter(app, prefix + '/channel-info', channelInfoRouter);
	useRouter(app, prefix + '/channels', channelRouter);
	useRouter(app, prefix + '/subscriptions', subscriptionRouter);
	useRouter(app, prefix + '/identities', identityRouter);
	useRouter(app, prefix + '/authentication', authenticationRouter);
	useRouter(app, prefix + '/verification', verificationRouter);


	app.use(errorMiddleware);
	app.listen(port, async () => {
		logger.log(`Started API Server on port ${port}`);
		await MongoDbService.connect(dbUrl, dbName);
	});
}
startServer();
