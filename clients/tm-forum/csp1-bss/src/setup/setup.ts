import { createIdentity } from '../services/identity.serivce';

import { getChannelAddress } from '../config/config';
import { checkSubscriptionState } from '../services/subscription.service';

export const setup = async () => {
	const id = await createIdentity();
	const channelAddress = getChannelAddress();
	await checkSubscriptionState(channelAddress, id);
};
