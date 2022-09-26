require('dotenv').config(); // eslint-disable-line
import { createDeviceIdentity } from '../services/identity.service';
import { getChannelAddress } from '../config/config';

export const setupDevice = async () => {
	const id = await createDeviceIdentity();
	const channelAddress = getChannelAddress();
	return { id, channelAddress };
};
