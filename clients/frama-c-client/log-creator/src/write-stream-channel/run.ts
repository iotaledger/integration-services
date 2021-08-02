import { writeStream } from '.';
import fs from 'fs';

const run = () => {
	const channelBuffer = fs.readFileSync('./src/config/Channel.json');
	const channel = JSON.parse(channelBuffer.toString());
	const channelAddress = channel.channelAddress;
	writeStream(channelAddress);
};

run();
