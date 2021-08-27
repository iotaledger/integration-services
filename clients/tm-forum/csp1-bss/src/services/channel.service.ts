import { CONFIG, getChannelAddress } from '../config/config';
import { csp1Client } from '../utils/client';

let lock = 1;

export const writeChannel = async (payload: any, type: string) => {
	try {
		return new Promise(async (resolve) => {
			lock = 0;
			console.log('Writing to dlt...');
			const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';
			const channelAddress = getChannelAddress();
			const body = {
				type,
				payload
			};

			const response = await csp1Client.post(`${CONFIG.baseUrl}/channels/logs/${channelAddress}${apiKey}`, body);

			if (response.status === 200) {
				console.log('Successfully written to channel!');
				lock = 1;
			}
			resolve(response);
		});
	} catch (error) {
		console.log('Could not write channel');
		console.log(error);
		lock = 1;
	}
};

const forwardedViolations: any = [];

export const pollChannel = async (poolingDelay = 5000): Promise<any> => {
	try {
		return new Promise((resolve) => {
			const interval = setInterval(async () => {
				if (lock === 1) {
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

					clearInterval(interval);
					resolve(newViolations);
				}
			}, poolingDelay);
		});
	} catch (error) {
		console.log('Could not fetch channel', error);
	}
};
