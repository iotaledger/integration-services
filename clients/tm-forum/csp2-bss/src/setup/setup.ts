
import { getChannelAddress } from '../config/config';
import { createIdentity } from '../services/identity.serivce';
import { checkSubscriptionState } from '../services/subscription.service';

export const setup = async () => {
	const identityId = await createIdentity();
	const channelAddress = getChannelAddress();
	await checkSubscriptionState(channelAddress, identityId);
};
