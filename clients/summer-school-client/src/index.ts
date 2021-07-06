import * as dotenv from 'dotenv';
dotenv.config();
import { fetchAuth } from './authenticate';
import { UserIdentity } from './config';

async function app() {
	console.log('---- start UserIdentity ----');
	await fetchAuth(UserIdentity).then((res) => {
		if (res.status === 200) {
			console.log('### Valid JWT: ', res.data);
		}
	});
	console.log('---- done UserIdentity ----');
}

app();
