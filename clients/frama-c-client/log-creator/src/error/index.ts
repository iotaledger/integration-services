import axios from 'axios';
import { fetchAuth } from '../authenticate';

export const errFunc = () => (error: any) => {
	if (error?.response?.status !== 401) {
		console.log(`received status from endpoint: ${error.response?.status}`);
	}

	const originalRequest = error.config;
	if (error?.response?.status === 401 && !originalRequest._retry) {
		originalRequest._retry = true;
		return fetchAuth().then((res) => {
			if (res.status === 200) {
				const bearerToken = 'Bearer ' + res.data?.jwt;
				axios.defaults.headers.common['Authorization'] = bearerToken;
				return axios(originalRequest);
			}
		});
	}
};
