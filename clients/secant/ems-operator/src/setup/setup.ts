import { createDeviceIdentity } from '../services/identity.serivce';

import { getChannelAddress } from '../config/config';

export const setup = async () => {
	const id = await createDeviceIdentity();
	const channelAddress = getChannelAddress();
	return { id, channelAddress };
};
