import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import swaggerUi from "swagger-ui-express";
import { errorMiddleware } from './middlewares/error';
import { authenticationRouter, verificationRouter, channelInfoRouter, channelRouter, subscriptionRouter, identityRouter } from './routes/router';
import { MongoDbService } from './services/mongodb-service';
import { CONFIG } from './config';
import morgan from 'morgan';
import { setupApi } from './setup';
import swaggerJsdoc from 'swagger-jsdoc';
import './routes/authentication/index'
import './routes/authentication/usersController'

function useRouter(app: express.Express, prefix: string, router: express.Router) {
	console.log(router.stack.map((r) => `${Object.keys(r?.route?.methods)?.[0].toUpperCase()}  ${prefix}${r?.route?.path}`));
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
			title: 'Hello World',
			version: '1.0.0',
		  },
		  servers: [
			  {
				"url": `/api/${version}`,
				"description": "Local Dev" 
			  }
		  ]
		},
		apis: ['./src/routes/**/*.ts'], // files containing annotations as above
	  };
	
	  const openapiSpecification = swaggerJsdoc(options);

	app.use(express.json({ limit: '10mb' }));
	app.use(express.urlencoded({ limit: '10mb', extended: true }));
	app.use(loggerMiddleware);
	app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

	const prefix = `/api/${version}`;
	useRouter(app, prefix + '/channel-info', channelInfoRouter);
	useRouter(app, prefix + '/channels', channelRouter);
	useRouter(app, prefix + '/subscriptions', subscriptionRouter);
	useRouter(app, prefix + '/identities', identityRouter);
	useRouter(app, prefix + '/authentication', authenticationRouter);
	useRouter(app, prefix + '/verification', verificationRouter);


	app.use(errorMiddleware);
	app.listen(port, async () => {
		console.log(`Started API Server on port ${port}`);
		await MongoDbService.connect(dbUrl, dbName);
	});
}
startServer();
