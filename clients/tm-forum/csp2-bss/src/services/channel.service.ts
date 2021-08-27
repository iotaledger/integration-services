import { CONFIG, getChannelAddress } from '../config/config';
import { csp2Client } from '../utils/client';

export const writeChannel = async (payload: any, type: string) => {
	try {
		console.log('Writing violation to channel...');
		const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';
		const channelAddress = getChannelAddress();
		const body = {
			type,
			payload
		};
		const response = await csp2Client.post(`${CONFIG.baseUrl}/channels/logs/${channelAddress}${apiKey}`, body);

		if (response?.status === 200) {
			console.log('Successfully written to channel!');
		}
		return response;
	} catch (error) {
		console.log(error);
	}
};
