import { getChannelData } from '.';
import { ChannelAddress } from '../config';

const run = () => {
	const channelAddress = ChannelAddress;
	getChannelData(channelAddress);
};

run();
