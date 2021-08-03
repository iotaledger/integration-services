import { requestSubscription } from '.';
import { ChannelAddress } from '../config';

const run = () => {
	const channelAddress = ChannelAddress;
	requestSubscription(channelAddress);
};

run();
