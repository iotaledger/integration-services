import { CONFIG, getChannelAddress } from '../config/config';
import { csp1Client } from '../utils/client';

export const writeChannel = async (payload: any, type: string) => {
	try {
		const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';
		const channelAddress = getChannelAddress();
		const body = {
			type,
			payload
		};
		console.log(body);
		const response = await csp1Client.post(`${CONFIG.baseUrl}/channels/logs/${channelAddress}${apiKey}`, body);
		console.log(response.data);
		console.log(response.status);
		return response;
	} catch (error) {
		console.log(error);
	}
};

export const poolChannel = async (poolingDelay = 10000) => {
	try {
		// eslint-disable-next-line no-constant-condition
		while (true) {
			console.log('Fetching channel...');
			const channelAddress = getChannelAddress();
			const response = await csp1Client.get(`${CONFIG.baseUrl}/channels/logs/${channelAddress}`);
			const channelData = response?.data;
			const slaViolations = channelData.filter((data: any) => data.channelLog.type === 'slaViolation');
			console.log(`Number of violations: ${slaViolations.length}`);
			const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
			await delay(poolingDelay);
		}
	} catch (error) {
		console.log(error);
	}
};
