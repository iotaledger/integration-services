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
				title: 'Ecommerce-SSI Bridge',
				version: '1.0.0',
				description: `The Ecommerce-SSI Bridge allows users to create Self-Sovereign Identities, linking Decentralized Identifiers (DIDs) to their specification (DID Documents). DIDs are public/private key pairs and can be created for organizations, individuals and objects. Each identity is represented by a unique public key immutably stored onto the ledger (in our case the IOTA Tangle).
				 Identities and public keys are used to anchor off-chain Verifiable Credentials (VCs), certificates containing identity attributes and signed by an Issuer identity (using its private key). The Issuer itself is an entity with its own decentralized identity. The Bridge allows an identified trust root to verify users identity. Verified identities can then propagate this verification 
				 to other entities (organizations, individuals, objects) identity using a network of trust approach`
			},
			servers: [
				{
					"url": `/api/${version}`,
					"description": "Local Dev"
				}
			]
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
