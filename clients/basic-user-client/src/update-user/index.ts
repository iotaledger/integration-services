import { Config, UserIdentity } from '../config';
import { fetchAuth } from '../authenticate';
import axios from 'axios';
import { AxiosRequestConfig } from 'axios';

const identity = UserIdentity;
const body: any = {
	identityId: identity.doc.id,
	username: 'homework-test-person-1',
	registrationDate: '2020-06-21T12:58:13Z',
	claim: {
		type: 'Person',
		name: 'Jon Tomson',
		familyName: 'Tomson',
		givenName: 'Jon',
		birthDate: '1980-06-21'
	}
};

const axiosOptions: AxiosRequestConfig = {
	headers: {
		'Content-Type': 'application/json'
	}
};

const errFunc = (error: any) => {
	console.log(`received status from update user endpoint: ${error.response?.status}`);

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

axios.interceptors.response.use((response) => response, errFunc);

export const updateUser = async () => {
	console.log('requesting update user endpoint...', identity);
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';
	const res = await axios.put(`${Config.baseUrl}/identities/identity${apiKey}`, JSON.stringify(body), axiosOptions);
	console.log(`received status from update user endpoint: ${res?.status}`);

	if (res?.status === 200) {
		console.log('successfully updated user!');
	}
};
