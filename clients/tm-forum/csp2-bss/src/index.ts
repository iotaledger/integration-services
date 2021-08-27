import * as dotenv from 'dotenv';
dotenv.config({ debug: true });
import { SlaViolation } from './config/config';
import { writeChannel } from './services/channel.service';
import { setup } from './setup/setup';

const app = async () => {
	const isAuthorized = await setup();
	if (isAuthorized) {
		await writeChannel(SlaViolation, 'slaViolation');
	}
};

app();
