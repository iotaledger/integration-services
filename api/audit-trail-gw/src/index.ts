import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from './middlewares/error';
import { channelInfoRouter, channelRouter, subscriptionRouter } from './routers';
import { MongoDbService, Logger } from '@iota/is-shared-modules';
import * as expressWinston from 'express-winston';
import swaggerJsdoc from 'swagger-jsdoc';
import { openApiDefinition } from './routers/swagger';
import { serverInfoRouter } from './routers/server-info';
import yargs from 'yargs';
import { ConfigurationService } from './services/configuration-service';
import { SetupManager } from './setup/setup-manager';
import { latencyMiddleware, register, statusMiddleware } from './middlewares/metrics';

const argv = yargs.command('server', 'Start the integration service API', {}).command('setup-api', 'Setups the API', {}).help().argv;

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

		await MongoDbService.connect(config.databaseUrl, config.databaseName);

		const app = express();

		const port = config.port;
		const dbUrl = config.databaseUrl;
		const dbName = config.databaseName;
		const version = config.apiVersion;
		const openapiSpecification = swaggerJsdoc(openApiDefinition);

		app.use(express.json({ limit: '10mb' }));
		app.use(express.urlencoded({ limit: '10mb', extended: true }));
		app.use(expressWinston.logger(logger.getExpressWinstonOptions()));
		app.use('/audit-trail-gw/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification, { explorer: true }));
		// Monitoring middlewares
		app.use(errorMiddleware);
		app.use(statusMiddleware);
		app.use(latencyMiddleware);

		const prefix = `/api/${version}`;
		useRouter(app, prefix + '/channel-info', channelInfoRouter);
		useRouter(app, prefix + '/channels', channelRouter);
		useRouter(app, prefix + '/subscriptions', subscriptionRouter);
		useRouter(app, '', serverInfoRouter);
		app.get('/audit-trail-metrics', async function (_, res) {
			res.setHeader('Content-Type', register.contentType);
			res.status(200).end(await register.metrics());
		});

		const server = app.listen(port, async () => {
			logger.log(`Started API Server on port ${port}`);
			await MongoDbService.connect(dbUrl, dbName);
		});
		server.setTimeout(50000);
	} catch (e) {
		Logger.getInstance().error(e.message);
		await MongoDbService.disconnect();
		process.exit(0);
	}
}

async function setupApi() {
	try {
		const setupManager = new SetupManager();
		await setupManager.runSetup();
	} catch (e) {
		Logger.getInstance().error(e);
		process.exit(-1);
	}
	process.exit();
}

if (argv._.includes('server')) {
	startServer();
} else if (argv._.includes('setup-api')) {
	setupApi();
} else {
	yargs.showHelp();
}
