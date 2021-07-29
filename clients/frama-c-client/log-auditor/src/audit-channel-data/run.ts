import { auditChannelData } from '.';
import { ChannelAddress } from '../config';

const run = () => {
	const channelAddress = ChannelAddress;
	auditChannelData(channelAddress);
};

run();
