import { getSubscriptionLinks } from '../config/config';
import { createChannel } from '../services/channel.service';
import { createIdentity } from '../services/identity.serivce';
import { checkSubscriptionState } from '../services/subscription.service';
import fs from 'fs';

export const setup = async () => {
	await createIdentity();
	let channelAddress = '';

	if (fs.existsSync('./src/config/Channel.json')) {
		const channelBuffer = fs.readFileSync('./src/config/Channel.json');
		const channel = JSON.parse(channelBuffer.toString());
		console.log(`Channel already created, channel address: ${channel.channelAddress}`);
		channelAddress = channel.channelAddress;
	} else {
		await createChannel();
		process.exit(0);
	}

	const { csp1SubscriptionLink } = getSubscriptionLinks();
	const isCsp1Authorized = await checkSubscriptionState(channelAddress, csp1SubscriptionLink);
	if (!isCsp1Authorized) {
		console.log('subscription is not authorized!');

		process.exit(0);
	}
};
