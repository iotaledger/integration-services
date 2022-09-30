require('dotenv').config(); // eslint-disable-line
import { createDoctorIdentity } from '../services/identity.service';
import { data4, data5 } from '../config/dataset';
import { writeChannel, getChannelAddress } from '../services/channel.service';

export const writeMessages = async () => {
	const id = await createDoctorIdentity();
	const channelAddress = await getChannelAddress();
	console.log('channelAddress', channelAddress);
	await writeChannel(channelAddress, { ...data4 }, 'operationUpdate');
	await writeChannel(channelAddress, { ...data5 }, 'operationUpdate');
	return { id, channelAddress };
};

writeMessages();
