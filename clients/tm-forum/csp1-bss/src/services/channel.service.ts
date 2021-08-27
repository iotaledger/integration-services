import { CONFIG, getChannelAddress } from '../config/config';
import { csp1Client } from '../utils/client';


export const writeChannel = async (payload: any, type: string) => {
	try {
		console.log(`Writing ${type} to dlt...`);
		const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';
		const channelAddress = getChannelAddress();
		const body = {
			type,
			payload
		};

		const response = await csp1Client.post(`${CONFIG.baseUrl}/channels/logs/${channelAddress}${apiKey}`, body);

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



