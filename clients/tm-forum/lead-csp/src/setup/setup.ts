import { getSubscriptionLinks } from '../config/config';
import { createChannel } from '../services/channel.service';
import { createIdentity } from '../services/identity.serivce';
import { checkSubscriptionState } from '../services/subscription.service';

export const setup = async () => {
	await createIdentity();
	const channelAddress = await createChannel();
	const { csp1SubscriptionLink, csp2SubscriptionLink } = getSubscriptionLinks();
	await checkSubscriptionState(channelAddress, csp1SubscriptionLink);
	await checkSubscriptionState(channelAddress, csp2SubscriptionLink);
};
