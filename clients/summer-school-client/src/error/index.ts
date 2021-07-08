import axios from 'axios';
import { fetchAuth } from '../authenticate';

export const errFunc = (identity) => (error: any) => {
	console.log(`received status from endpoint: ${error.response?.status}`);

	const originalRequest = error.config;
	if (error?.response?.status === 401 && !originalRequest._retry) {
		originalRequest._retry = true;
		return fetchAuth(identity).then((res) => {
			if (res.status === 200) {
				console.log('### Valid JWT: ', res.data);
				const bearerToken = 'Bearer ' + res.data?.jwt;
				axios.defaults.headers.common['Authorization'] = bearerToken;
				return axios(originalRequest);
			}
		});
	}
};
