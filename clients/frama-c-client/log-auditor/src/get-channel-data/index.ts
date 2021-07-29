import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

import { logAuditorClient } from '../error/index';
import { Config } from '../config';
import { hashNonce } from '../utils/encryption';

export const getChannelData = async (channelAddress: string): Promise<void> => {
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

	const res = await logAuditorClient.get(`${Config.baseUrl}/channels/logs/${channelAddress}${apiKey}`);

	if (res?.status === 200) {
		console.log('successfully read channel data');
		console.log('###########################');
		auditChannelData(res.data);
	}
};

const auditChannelData = async (channelData: any[]) => {
	if (channelData.length === 0) {
		return console.log('Data stream is empty');
	}
	const hashedFiles = await loadAndHashFiles();
	let validDocuments = 0;
	for (const data of channelData) {
		const payload = data.channelLog.payload;
		const logKey = Object.keys(payload)[0];
		// eslint-disable-next-line no-prototype-builtins
		if (hashedFiles.hasOwnProperty(logKey)) {
			if (hashedFiles[logKey] === payload[logKey]) {
				console.log('~~~~~~~Log is valid!~~~~~~~');
				validDocuments++;
			} else {
				console.log('~~~~~~~Log is invalid!~~~~~~~');
			}
		} else {
			console.log('The log-creator seems to have different files than the log-auditor.');
		}
	}
	if (Object.keys(hashedFiles).length === validDocuments) {
		return console.log('All documents are valid!');
	}
	return console.log('There are some invalid documents!');
};

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
