require('dotenv').config(); // eslint-disable-line
import { createDoctorIdentity } from '../services/identity.service';
import { createStreamChannel } from '../create-stream-channel/index';

export const setupEmsProvider = async () => {
	const id = await createDoctorIdentity();
	const channelAddress = await createStreamChannel();
	return { id, channelAddress };
};

setupEmsProvider();
