import { createIdentity } from '../services/identity.serivce';

import { getChannelAddress } from '../config/config';

export const setup = async () => {
	const id = await createIdentity();
	const channelAddress = getChannelAddress();
	return { id, channelAddress };
};
