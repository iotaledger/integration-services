import axios, { AxiosRequestConfig } from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

import { errFunc } from '../error';
import { Config, ChannelAddress } from '../config';
import { hashNonce } from '../utils/encryption';

const axiosOptions: AxiosRequestConfig = {
    headers: {
        'Content-Type': 'application/json'
    }
};

axios.interceptors.response.use((response) => response, errFunc());

const getChannelData = async (channelAddress: string) => {
    const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

    const res = await axios.get(`${Config.baseUrl}/channels/logs/${channelAddress}${apiKey}`, axiosOptions);

    if (res?.status === 200) {
        console.log('successfully read channel data');
        console.log('###########################');
        auditChannelData(res.data)
    }
};

const auditChannelData = async (channelData: any[]) => {
    if (channelData.length === 0) {
        return console.log('Data stream is empty');
    }
    const hashedFiles = await loadAndHashFiles();
    let validDocuments = 0;
    for (const data of channelData) {
        const payload = data.channelLog.payload
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
            console.log('The log creator seems to have differnt logs than the auditor.');
        }
    }
    if (Object.keys(hashedFiles).length === validDocuments) {
        return console.log('All documents are valid!');
    }
    return console.log('There are some invalid documents!');
}

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

const run = () => {
    const channelAddress = ChannelAddress;
    getChannelData(channelAddress);
};

run();
