import { Config } from '../config';
import { fetchAuth } from '../authenticate';
import axios from 'axios';
import { AxiosRequestConfig } from 'axios';

const body: any = {
	userId: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
	publicKey: '8WaGsr277JQaqV9fxHmFNGC9haApFbBfdnytmq5gq4vm',
	username: 'first-user',
	firstName: 'Tom',
	lastName: 'Sonson',
	organization: 'IOTA',
	classification: 'human',
	subscribedChannelIds: [],
	description: 'Just a user'
};

let axiosOptions: AxiosRequestConfig = {
	headers: {
		'Content-Type': 'application/json'
	}
};

const errFunc = (error: any) => {
	console.log(`received status from update user endpoint: ${error.response?.status}`);

	const originalRequest = error.config;
	if (error.response.status === 401 && !originalRequest._retry) {
		originalRequest._retry = true;
		return fetchAuth().then((res) => {
			if (res.status === 200) {
				console.log('### Valid JWT: ', res.data);
				const bearerToken = 'Bearer ' + res.data?.jwt;
				axios.defaults.headers.common['Authorization'] = bearerToken;
				return axios(originalRequest);
			}
		});
	}
};

axios.interceptors.response.use((response) => response, errFunc);

export const updateUser = async () => {
	console.log('requesting update user endpoint...');
	const res = await axios.put(`${Config.baseUrl}/api/v1/users/user`, JSON.stringify(body), axiosOptions);

	console.log(`received status from update user endpoint: ${res?.status}`);

	if (res?.status === 200) {
		console.log('successfully updated user!');
	}
};
