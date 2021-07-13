import * as dotenv from 'dotenv';
dotenv.config();
import axios, { AxiosRequestConfig } from 'axios';
import fs from 'fs';

import { ChannelConfig, Config } from '../config';
import { errFunc } from '../error';

const axiosOptions: AxiosRequestConfig = {
	headers: {
		'Content-Type': 'application/json'
	}
};

axios.interceptors.response.use((response) => response, errFunc());

const createStreamChannel = async () => {
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

	const res = await axios.post(`${Config.baseUrl}/channels/create${apiKey}`, JSON.stringify(ChannelConfig), axiosOptions);

	if (res?.status === 201) {
		console.log('successfully created channel!');
		console.log('#####################');
		console.log(`Channel address: ${res.data.channelAddress}`);
		fs.writeFileSync('./src/config/Channel.json', JSON.stringify(res.data));
	}
};

const run = () => {
	createStreamChannel();
};

run();
