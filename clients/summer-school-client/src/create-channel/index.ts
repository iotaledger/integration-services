import * as dotenv from 'dotenv';
dotenv.config();
import { Config } from '../config';
import axios from 'axios';
import { AxiosRequestConfig } from 'axios';
import { errFunc } from '../error';

const axiosOptions: AxiosRequestConfig = {
	headers: {
		'Content-Type': 'application/json'
	}
};

const authorIdentity = {
	doc: {
		id: 'did:iota:5dBV6Kd3rDnusvi5kWcB8KHuvES5Q3fwqyYMqmns8uDN',
		authentication: [
			{
				id: 'did:iota:5dBV6Kd3rDnusvi5kWcB8KHuvES5Q3fwqyYMqmns8uDN#key',
				controller: 'did:iota:5dBV6Kd3rDnusvi5kWcB8KHuvES5Q3fwqyYMqmns8uDN',
				type: 'Ed25519VerificationKey2018',
				publicKeyBase58: 'AixS9q6WkFRyvvk1L7hfWUmPGff16jaP3Fs5bLkkGfwj'
			}
		],
		created: '2021-07-06T09:50:19Z',
		updated: '2021-07-06T09:50:19Z',
		proof: {
			type: 'JcsEd25519Signature2020',
			verificationMethod: '#key',
			signatureValue: '51RrTnF8TCVebLrq4yaEw9GvVvMWCcS3LtWCZq3i96iq25PCuvjj2YkjxXKAvujSRU9mrSXbDJK6yj9H6Pd7XyGs'
		}
	},
	key: {
		type: 'ed25519',
		public: 'AixS9q6WkFRyvvk1L7hfWUmPGff16jaP3Fs5bLkkGfwj',
		secret: 'DKR1JyvgLhiuo8VdcvhTsH7EXFk4DE3mwpaLoXCG736C',
		encoding: 'base58'
	},
	txHash: '580f736ca12f35b51b18e1056db5987f5a5b83ed1900d59b19b890ac55f47b69'
}; // TODO set this author identity

axios.interceptors.response.use((response) => response, errFunc(authorIdentity));

export const createChannel = async (authorIdentity) => {
	if (!authorIdentity) {
		throw new Error('no author defined!');
	}
	const body = {
		topics: [{ type: 'smart-audit-log', source: 'devices and user' }],
		encrypted: false
	};
	console.log('creating channel for identity:', authorIdentity);
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';
	const res = await axios.post(`${Config.baseUrl}/channels/create${apiKey}`, JSON.stringify(body), axiosOptions);
	console.log(`received status from create channel endpoint: ${res?.status}`);

	if (res?.status === 201) {
		console.log('#### Successfully created the channel! ####');
		console.log('###########################################');
		console.log('###########################################');
		console.log(res.data);
		console.log('###########################################');
		console.log('###########################################');
	}
};

async function run() {
	try {
		await createChannel(authorIdentity);
	} catch (e) {
		console.log('e', e);
	}
}

run();
