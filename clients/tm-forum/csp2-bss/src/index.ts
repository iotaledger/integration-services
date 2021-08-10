import * as dotenv from 'dotenv';
dotenv.config({ debug: true });
import { SlaViolation } from './config/config';
import { writeChannel } from './services/channel.service';
import { setup } from './setup/setup';

const app = async () => {
	await setup();
	await writeChannel(SlaViolation, 'slaViolation');
};

app();
