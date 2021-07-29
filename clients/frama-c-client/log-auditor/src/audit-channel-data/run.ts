import fs from 'fs';
import { auditChannelData } from '.';

const run = () => {
	const channelDataBuffer = fs.readFileSync('./src/config/ChannelData.json');
	const channelData = JSON.parse(channelDataBuffer.toString());
	auditChannelData(channelData);
};

run();
