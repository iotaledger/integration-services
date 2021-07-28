import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

import { ChannelConfig, Config } from '../config';
import { logCreatorClient } from '../error/index';

export const createStreamChannel = async (): Promise<string | undefined> => {
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';
	const res = await logCreatorClient.post(`${Config.baseUrl}/channels/create${apiKey}`, JSON.stringify(ChannelConfig));
	if (res?.status === 201) {
		console.log('successfully created channel!');
		console.log('#####################');
		console.log(`Channel address: ${res.data.channelAddress}`);
		fs.writeFileSync('./src/config/Channel.json', JSON.stringify(res.data));
		return res.data.channelAddress
	}
};


