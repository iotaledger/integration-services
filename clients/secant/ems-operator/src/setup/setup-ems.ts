require('dotenv').config(); // eslint-disable-line
import { createDoctorIdentity } from '../services/identity.service';
import { createStreamChannel } from '../create-stream-channel/index';
import { writeChannel } from '../services/channel.service';
import { data1 } from '../config/dataset';

export const setupEmsProvider = async () => {
	const id = await createDoctorIdentity();
	const channelAddress = await createStreamChannel();

	await writeChannel(channelAddress, { ...data1, id }, 'initialize');
	return { id, channelAddress };
};

setupEmsProvider();
