import { getChannelAddress } from '../config/config';
import { createIdentity } from '../services/identity.serivce';
import { checkSubscriptionState } from '../services/subscription.service';

export const setup = async (): Promise<boolean> => {
	const identityId = await createIdentity();
	const channelAddress = getChannelAddress();
	return await checkSubscriptionState(channelAddress, identityId);
};
