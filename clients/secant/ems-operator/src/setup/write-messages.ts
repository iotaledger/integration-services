require('dotenv').config(); // eslint-disable-line
import { createDoctorIdentity } from '../services/identity.service';
import { data4, data5 } from '../config/dataset';
import { writeChannel, getChannelAddress } from '../services/channel.service';

export const setupEmsProvider = async () => {
	const id = await createDoctorIdentity();
	const channelAddress = await getChannelAddress();
	await writeChannel(channelAddress, { ...data4, id }, 'operation');
	await writeChannel(channelAddress, { ...data5, id }, 'operation');
	return { id, channelAddress };
};

setupEmsProvider();
