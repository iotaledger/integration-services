import { CONFIG, getChannelAddress } from '../config/config';
import { csp1Client } from '../utils/client';

export const writeChannel = async (payload: any, type: string) => {
	try {
		console.log('Writing to channel...');
		const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';
		const channelAddress = getChannelAddress();
		const body = {
			type,
			payload
		};

		const response = await csp1Client.post(`${CONFIG.baseUrl}/channels/logs/${channelAddress}${apiKey}`, body);

		if (response.status === 200) {
			console.log('Successfully written to channel!');
		}
		return response;
	} catch (error) {
		console.log(error);
	}
};

const forwardedViolations: any = [];
export const poolChannel = async (poolingDelay = 10000): Promise<any> => {
	return new Promise((resolve, reject) => {
		try {
			const interval = setInterval(async () => {
				console.log('Fetching channel...');
				const channelAddress = getChannelAddress();
				const response = await csp1Client.get(`${CONFIG.baseUrl}/channels/logs/${channelAddress}`);
				const channelData = response?.data;
				const slaViolations = channelData.filter((data: any) => data.channelLog.type === 'slaViolation');
				const newViolations = slaViolations.filter((violation: any) => !forwardedViolations.includes(violation.link));
				console.log(`Number of new violations: ${newViolations.length}/${slaViolations.length}`);
				newViolations.forEach((newViolation: any) => {
					forwardedViolations.push(newViolation.link);
				});
				if (newViolations.length !== 0) {
					clearInterval(interval);
					resolve(newViolations);
				}
			}, poolingDelay);
		} catch (error) {
			console.log('Could not fetch channel', error);
			reject();
		}
	});
};
