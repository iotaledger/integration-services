import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

import { productOrderRouter } from './routers/product-order.router';
import { serviceOrderRouter } from './routers/service-order.router';

function useRouter(app: express.Express, prefix: string, router: express.Router) {
	const messages = router.stack.map((r) => `${Object.keys(r?.route?.methods)?.[0].toUpperCase()}  ${prefix}${r?.route?.path}`);
	messages.map((m) => console.log(m));

	app.use(prefix, router);
}

const startServer = () => {
	const app = express();
	const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
	const apiVersion = process.env.API_VERSION;

	const prefix = '/tmf-api';
	useRouter(app, `${prefix}/productOrderingManagement/${apiVersion}`, productOrderRouter);
	useRouter(app, `${prefix}/serviceOrdering/${apiVersion}`, serviceOrderRouter);

	app.listen(port, () => {
		app._router.stack.forEach((router: any) => {
			if (router.stack) {
				router.stack.map((r: any) => `${Object.keys(r?.route?.methods)?.[0].toUpperCase()}  ${prefix}${r?.route?.path}`);
			}
		});
		console.log(`API running on port ${port}`);
	});
};

startServer();
