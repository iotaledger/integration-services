import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { authenticationRouter } from './routers/authentication.router';
import cors from 'cors';
import { verificationRouter } from './routers/verification.router';

const start = () => {
	const app = express();
	app.use(cors());
	app.use(express.json());
	app.use(authenticationRouter);
	app.use(verificationRouter);

	const port = 3005
	app.listen(port, () => {
		console.log(`App running on port ${port}`);
	});
};

start();
