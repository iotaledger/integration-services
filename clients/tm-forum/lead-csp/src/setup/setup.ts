import { getSubscriptionLink } from '../config/config';
import { createChannel } from '../services/channel.service';
import { createIdentity } from '../services/identity.serivce';
import { checkSubscriptionState } from '../services/subscription.service';

export const setup = async () => {
	await createIdentity();
	const channelAddress = await createChannel();
	const csp1SubscriptionLink = getSubscriptionLink();
	await checkSubscriptionState(channelAddress, csp1SubscriptionLink);
};
