import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

import { Config } from '../config';
import { hashNonce } from '../utils/encryption/index';
import { logCreatorClient } from '../error/index';

const folder = './log-files/';

const loadAndHashFiles = async (): Promise<any> => {
	const hashedFiles: any = {};
	const files = fs.readdirSync(folder);
	for (const file of files) {
		const rawData = fs.readFileSync(folder + file);
		const hashedFile = hashNonce(rawData.toString());
		const fileName = hashNonce(file);
		hashedFiles[fileName] = hashedFile;
	}

	return hashedFiles;
};

export const writeStream = async (channelAddress: string): Promise<void> => {
	console.log('Writing logs to stream...');
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';
	const hashedFiles = await loadAndHashFiles();

	const requests = [];
	let finishedRequests = 1;
	for (const hashedFileKey of Object.keys(hashedFiles)) {
		console.log(`Writing log ${finishedRequests}/${Object.keys(hashedFiles).length}...`);
		const body = {
			type: 'json',
			payload: { [hashedFileKey]: hashedFiles[hashedFileKey] }
		};
		const request = await logCreatorClient.post(`${Config.baseUrl}/channels/logs/${channelAddress}${apiKey}`, body);
		finishedRequests++;
		requests.push(request);
	}

	if (requests.every((request) => request.status == 200)) {
		console.log(`Data successfully written to channel: ${channelAddress}`);
	}
};
