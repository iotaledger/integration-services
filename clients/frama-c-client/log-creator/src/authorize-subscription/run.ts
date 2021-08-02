import fs from 'fs';
import { authorizeSubscription } from '.';
import { SubscriptionLink } from '../config';

const run = () => {
	const channelBuffer = fs.readFileSync('./src/config/Channel.json');
	const channel = JSON.parse(channelBuffer.toString());
	const channelAddress = channel.channelAddress;
	const subsciptionLink = SubscriptionLink;
	authorizeSubscription(channelAddress, subsciptionLink);
};

run();
