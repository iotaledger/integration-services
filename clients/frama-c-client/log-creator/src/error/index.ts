import axios from 'axios';
import { fetchAuth } from '../authenticate';

const getBearerToken = async () => {
	const response = await fetchAuth();
	if (response.status === 200) {
		const bearerToken = 'Bearer ' + response.data?.jwt;
		return bearerToken
	}
};

const errFunc = async (error: any) => {
	// console.log('ERRRROR', error)
	const originalRequest = error.config;
	if (error?.response?.status === 401 && !originalRequest._retry) {
		console.log("Retrying Request")
		originalRequest._retry = true;
		const token = await getBearerToken();
		logCreatorClient.defaults.headers.common['Authorization'] = token
		originalRequest.headers['Authorization'] = token
		return axios(originalRequest);
	}
};


export const logCreatorClient = axios.create({
	headers: {
		'Content-Type': 'application/json'
	},
});

logCreatorClient.interceptors.response.use(response => response, error => errFunc(error))