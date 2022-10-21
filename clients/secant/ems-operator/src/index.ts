require('dotenv').config(); // eslint-disable-line
import { writeChannel } from './services/channel.service';
import { createDoctorIdentity } from './services/identity.service';
import { createStreamChannel } from './create-stream-channel/index';
import { data1 } from './config/dataset';

const startDevice = async () => {
	const id = await createDoctorIdentity();
	const channelAddress = await createStreamChannel();
	await writeChannel(channelAddress, { ...data1, id }, 'initialize');
	console.log('Device demo finished :)');
};

startDevice();
