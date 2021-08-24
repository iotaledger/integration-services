import { getSubscriptionLinks } from "../config/config";
import { authorizeSubscription, createChannel } from "../services/channel.service";
import { createIdentity } from "../services/identity.serivce";

export const setup = async () => {
    await createIdentity();
    const channelAddress = await createChannel();
    const {csp1SubscriptionLink, csp2SubscriptionLink} = getSubscriptionLinks();
    await authorizeSubscription(channelAddress, csp1SubscriptionLink);
    await authorizeSubscription(channelAddress, csp2SubscriptionLink);
};
