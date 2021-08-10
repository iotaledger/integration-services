import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

import { CONFIG } from './config/config';
import { productOrderRouter } from './routers/product-order.router';
import { ViolationRouter } from './routers/violation.router';
import { serviceOrderRouter } from './routers/service-order.router';
import { setup } from './setup/setup';
import { poolChannel } from './services/channel.service';
import { writeViolations } from './services/violation.service';

function useRouter(app: express.Express, prefix: string, router: express.Router) {
	const messages = router.stack.map((r) => `${Object.keys(r?.route?.methods)?.[0].toUpperCase()}  ${prefix}${r?.route?.path}`);
	messages.map((m) => console.log(m));

	app.use(prefix, router);
}

const startServer = async () => {
	await setup();

	const app = express();
	const port = CONFIG.port;
	const apiVersion = CONFIG.apiVersion;

	const prefix = '/tmf-api';
	app.use(express.json());
	useRouter(app, `${prefix}/productOrderingManagement/${apiVersion}`, productOrderRouter);
	useRouter(app, `${prefix}/serviceOrdering/${apiVersion}`, serviceOrderRouter);
	useRouter(app, `${prefix}/violations/${apiVersion}`, ViolationRouter);
	app.listen(port, async () => {
		app._router.stack.forEach((router: any) => {
			if (router.stack) {
				router.stack.map((r: any) => `${Object.keys(r?.route?.methods)?.[0].toUpperCase()}  ${prefix}${r?.route?.path}`);
			}
		});
		console.log(`API running on port ${port}`);
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const newViolations = await poolChannel();
			await writeViolations(newViolations);
		}
	});
};

startServer();
