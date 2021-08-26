import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

import { CONFIG } from './config/config';
import { productOrderRouter } from './routers/product-order.router';
import { violationRouter } from './routers/violation.router';
import { serviceOrderRouter } from './routers/service-order.router';
import { setup } from './setup/setup';
import { pollChannel } from './services/channel.service';
import { forwardSlaViolation } from './services/violation.service';

function useRouter(app: express.Express, prefix: string, router: express.Router) {
	const messages = router.stack.map((r) => `${Object.keys(r?.route?.methods)?.[0].toUpperCase()}  ${prefix}${r?.route?.path}`);
	messages.map((m) => console.log(m));

	app.use(prefix, router);
}

const startServer = async () => {
	await setup();

	const app = express();
	const port = CONFIG.port;

	const prefix = '/tmf-api';
	app.use(express.json());
	useRouter(app, `${prefix}/productOrderingManagement/${CONFIG.tmf622Version}`, productOrderRouter);
	useRouter(app, `${prefix}/serviceOrdering/${CONFIG.tmf641Version}`, serviceOrderRouter);
	useRouter(app, `${prefix}/slaManagement/${CONFIG.tmf623Version}`, violationRouter);
	app.listen(port, async () => {
		app._router.stack.forEach((router: any) => {
			if (router.stack) {
				router.stack.map((r: any) => `${Object.keys(r?.route?.methods)?.[0].toUpperCase()}  ${prefix}${r?.route?.path}`);
			}
		});
		console.log(`API running on port ${port}`);
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const newViolations = await pollChannel();
			for (const newViolation of newViolations) {
				await forwardSlaViolation(newViolation);
			}
		}
	});
};

startServer();
