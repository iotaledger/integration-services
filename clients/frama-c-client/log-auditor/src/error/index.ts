import axios from 'axios';
import { fetchAuth } from '../authenticate';

const getBearerToken = async () => {
	const response = await fetchAuth();
	if (response.status === 200) {
		const bearerToken = 'Bearer ' + response.data?.jwt;
		return bearerToken;
	}
};

const errFunc = async (error: any) => {
	const originalRequest = error.config;
	if (error?.response?.status === 401 && !originalRequest._retry) {
		originalRequest._retry = true;
		const token = await getBearerToken();
		logAuditorClient.defaults.headers.common['Authorization'] = token as string;
		originalRequest.headers['Authorization'] = token;
		return axios(originalRequest);
	}
};

export const logAuditorClient = axios.create({
	headers: {
		'Content-Type': 'application/json'
	}
});

logAuditorClient.interceptors.response.use(
	(response) => response,
	(error) => errFunc(error)
);
