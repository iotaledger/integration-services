import fs from 'fs';

import { ChannelConfig, CONFIG } from '../config/config';
import { leadCspClient } from '../utils/client';

export const createChannel = async (): Promise<string> => {
	const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';
	const res = await leadCspClient.post(`${CONFIG.baseUrl}/channels/create${apiKey}`, JSON.stringify(ChannelConfig));
	if (res?.status === 201) {
		console.log('successfully created channel!');
		console.log('###########################');
		console.log(`Channel address: ${res.data.channelAddress}`);

		const dir = './src/config/';
		if (!fs.existsSync(dir)) fs.mkdirSync(dir);
		fs.writeFileSync(`${dir}Channel.json`, JSON.stringify(res.data));
		return res.data.channelAddress;
	}
};
