import fs from 'fs';
import { hashNonce } from '../utils/encryption';

export const auditChannelData = async (channelData: any[]) => {
	if (channelData.length === 0) {
		return console.log('Data stream is empty');
	}
	const hashedFile = await loadAndHashFile();
	const data = channelData.find((data) => data.channelLog.payload.fileName === hashedFile.fileName);
	const payload = data.channelLog.payload;
	if (hashedFile.hashedFile === payload.hashedFile) {
		console.log(`~~~~~~~Log ${payload.fileName} is valid!~~~~~~~`);
	} else {
		console.log(`~~~~~~~Log ${payload.fileName}is invalid!~~~~~~~`);
	}
};

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
