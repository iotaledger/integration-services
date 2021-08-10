import axios from 'axios';
import { fetchAuth } from '../services/authentication.service';

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
		csp2Client.defaults.headers.common['Authorization'] = token;
		originalRequest.headers['Authorization'] = token;
		return axios(originalRequest);
	} else {
		console.log(`ERROR:`, error.response.data );
	}
};

export const csp2Client = axios.create({
	headers: {
		'Content-Type': 'application/json'
	}
});

csp2Client.interceptors.response.use(
	(response) => response,
	(error) => errFunc(error)
);
