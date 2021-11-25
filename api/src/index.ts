import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from './middlewares/error';
import { authenticationRouter, verificationRouter, channelInfoRouter, channelRouter, subscriptionRouter, identityRouter } from './routers';
import { MongoDbService } from './services/mongodb-service';
import * as expressWinston from 'express-winston';
import swaggerJsdoc from 'swagger-jsdoc';
import { Logger } from './utils/logger';
import { openApiDefinition } from './routers/swagger';
import { serverInfoRouter } from './routers/server-info';
import yargs from 'yargs';
import { KeyGenerator } from './setup';
import { ConfigurationService } from './services/configuration-service';

const argv = yargs
	.command('server', 'Start the integration service API', {})
	.command('keygen', 'Generate root identity for integration service API', {})
	.help().argv;

function useRouter(app: express.Express, prefix: string, router: express.Router) {
	const messages = router.stack.map((r) => `${Object.keys(r?.route?.methods)?.[0].toUpperCase()}  ${prefix}${r?.route?.path}`);
	messages.map((m) => Logger.getInstance().log(m));

	app.use(prefix, router);
}

process.on('uncaughtException', function (err) {
	// clean up allocated resources
	// log necessary error details to log files
	Logger.getInstance().error(`Uncaught Exception: ${err}`);
	process.exit(); // exit the process to avoid unknown state
});

async function startServer() {
	try {
		const logger = Logger.getInstance();
		const configService = ConfigurationService.getInstance(Logger.getInstance());
		const config = configService.config;

		await MongoDbService.connect(config.databaseUrl, config.databaseName, config.serverSecret);

		const rootIdentity = await configService.getRootIdentityId();

		// setup did for server if not exists
		if (!rootIdentity) {
			process.exit(0);
		}

		const app = express();

		const port = config.port;
		const dbUrl = config.databaseUrl;
		const dbName = config.databaseName;
		const version = config.apiVersion;
		const openapiSpecification = swaggerJsdoc(openApiDefinition);

		app.use(express.json({ limit: '10mb' }));
		app.use(express.urlencoded({ limit: '10mb', extended: true }));
		app.use(expressWinston.logger(logger.getExpressWinstonOptions()));

		app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification, { explorer: true }));

		const prefix = `/api/${version}`;
		useRouter(app, prefix + '/channel-info', channelInfoRouter);
		useRouter(app, prefix + '/channels', channelRouter);
		useRouter(app, prefix + '/subscriptions', subscriptionRouter);
		useRouter(app, prefix + '/identities', identityRouter);
		useRouter(app, prefix + '/authentication', authenticationRouter);
		useRouter(app, prefix + '/verification', verificationRouter);
		useRouter(app, '', serverInfoRouter);

		app.use(errorMiddleware);
		const server = app.listen(port, async () => {
			logger.log(`Started API Server on port ${port}`);
			await MongoDbService.connect(dbUrl, dbName, config.serverSecret);
		});
		server.setTimeout(50000);
	} catch (e) {
		Logger.getInstance().error(e.message);
		await MongoDbService.disconnect();
		process.exit(0);
	}
}

async function keyGen() {
	try {
		const configService = ConfigurationService.getInstance(Logger.getInstance());
		const config = configService.config;

		await MongoDbService.connect(config.databaseUrl, config.databaseName, config.serverSecret);
		const keyGenerator: KeyGenerator = new KeyGenerator(configService);

		await keyGenerator.keyGeneration();
	} catch (e) {
		Logger.getInstance().error(e);
		process.exit(-1);
	}
	await MongoDbService.disconnect();
	process.exit();
}

if (argv._.includes('server')) {
	startServer();
} else if (argv._.includes('keygen')) {
	keyGen();
} else {
	yargs.showHelp();
}
