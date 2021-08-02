import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

import { logAuditorClient } from '../error/index';
import { Config } from '../config';

export const getChannelData = async (channelAddress: string): Promise<any> => {
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

	const res = await logAuditorClient.get(`${Config.baseUrl}/channels/logs/${channelAddress}${apiKey}`);

	if (res?.status === 200) {
		console.log('successfully read channel data:');
		console.log(JSON.stringify(res.data));
		console.log('###########################');
		fs.writeFileSync('./src/config/ChannelData.json', JSON.stringify(res.data));
		return res.data;
	}
};
