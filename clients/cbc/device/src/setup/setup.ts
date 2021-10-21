import { createIdentity } from '../services/identity.serivce';

import { getChannelAddress } from '../config/config';

export const setup = async () => {
	const identityId = await createIdentity();
	const channelAddress = getChannelAddress();
	return { identityId, channelAddress };
};
