import { CONFIG } from '../config/config';
import { axiosClient } from '../utils/client';
import * as fs from 'fs';
import path from 'path';

export const getChannelAddress = () => {
	const channelPath = path.join(__dirname, '..', 'config', 'Channel.json');
	let file, channel;
	try {
		file = fs.readFileSync(channelPath);
		channel = file && JSON.parse(file.toString());
	} catch (e) {
		console.log('no identity file found');
	}
	return channel.channelAddress;
};

export const writeChannel = async (channelAddress: string, payload: any, type: string) => {
	try {
		console.log(`Writing ${type} to dlt...`);
		const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';
		const channelAddress = getChannelAddress();
		const body = {
			type,
			payload
		};

		const response = await axiosClient.post(`${CONFIG.baseUrl}/api/v0.1/channels/logs/${channelAddress}${apiKey}`, body);

		if (response?.status === 200) {
			console.log('Successfully written to dlt!');
			console.log('--------------------------------------------------------');
			console.log('--------------------------------------------------------');
		}
	} catch (error) {
		console.log('Could not write dlt');
		console.log(error);
	}
};
