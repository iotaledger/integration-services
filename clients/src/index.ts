import * as dotenv from 'dotenv';
dotenv.config();
import { updateUser } from './update-user';

async function app() {
	console.log('---- start ----');
	await updateUser();
	console.log('---- done ----');
}

app();
