import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { authenticationRouter } from './routers/authentication.router';


const start = () => {
	const app = express();
	app.use(express.json());
	app.use(authenticationRouter);
	app.listen(3000, () => {
		console.log('App running on port 3000')
	})
}

start();
