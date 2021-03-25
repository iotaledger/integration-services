import * as dotenv from 'dotenv';
dotenv.config();
import { fetchAuth } from './authenticate';
import { DeviceIdentity, ServerIdentity, UserIdentity } from './config';

async function app() {
	console.log('---- start ServerIdentity ----');
	await fetchAuth(ServerIdentity).then((res) => {
		if (res.status === 200) {
			console.log('### Valid JWT: ', res.data);
		}
	});
	console.log('---- done ServerIdentity ----');
	console.log('---- start UserIdentity ----');
	await fetchAuth(UserIdentity).then((res) => {
		if (res.status === 200) {
			console.log('### Valid JWT: ', res.data);
		}
	});
	console.log('---- done UserIdentity ----');
	console.log('---- start DeviceIdentity ----');
	await fetchAuth(DeviceIdentity).then((res) => {
		if (res.status === 200) {
			console.log('### Valid JWT: ', res.data);
		}
	});
	console.log('---- done DeviceIdentity ----');
	// await updateUser();
}

app();
