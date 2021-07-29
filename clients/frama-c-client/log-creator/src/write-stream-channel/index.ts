import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

import { Config } from '../config';
import { hashNonce } from '../utils/encryption/index';
import { logCreatorClient } from '../error/index';

const folder = './log-files/';

const loadAndHashFile = (): { fileName: string; hashedFile: string } => {
	const files = fs.readdirSync(folder);
	if (files.length === 0) {
		throw new Error('No logs in folder!');
	}
	const file = files[0];
	const rawData = fs.readFileSync(folder + file);
	const hashedFile = hashNonce(rawData.toString());
	return { fileName: file, hashedFile };
};

export const writeStream = async (channelAddress: string): Promise<void> => {
	console.log('Writing logs to stream...');
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';
	const hashedFile = await loadAndHashFile();
	console.log(`Writing log ${hashedFile.fileName}...`);
	const body = {
		type: 'json',
		payload: hashedFile
	};
	const request = await logCreatorClient.post(`${Config.baseUrl}/channels/logs/${channelAddress}${apiKey}`, body);
	if (request.status == 200) {
		console.log(`Data successfully written to channel: ${channelAddress}`);
	}
};
