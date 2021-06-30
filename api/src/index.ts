import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import { errorMiddleware } from './middlewares/error';
import { authenticationRouter, verificationRouter, channelInfoRouter, channelRouter, subscriptionRouter, identityRouter } from './routers';
import { MongoDbService } from './services/mongodb-service';
import { CONFIG } from './config';
import morgan from 'morgan';
import { setupApi } from './setup';
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

	app.use(express.json({ limit: '10mb' }));
	app.use(express.urlencoded({ limit: '10mb', extended: true }));
	app.use(loggerMiddleware);

	const prefix = `/api/${version}`;
	useRouter(app, prefix + '/channel-info', channelInfoRouter);
	useRouter(app, prefix + '/channels', channelRouter);
	useRouter(app, prefix + '/subscriptions', subscriptionRouter);
	useRouter(app, prefix + '/identities', identityRouter);
	useRouter(app, prefix + '/authentication', authenticationRouter);
	useRouter(app, prefix + '/verification', verificationRouter);

	app.use(errorMiddleware);
	const server = app.listen(port, async () => {
		logger.log(`Started API Server on port ${port}`);
		await MongoDbService.connect(dbUrl, dbName);
	});
	server.setTimeout(50000);
}
startServer();
