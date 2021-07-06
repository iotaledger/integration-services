import * as dotenv from 'dotenv';
dotenv.config();
import { Config } from '../config';
import axios from 'axios';
import { AxiosRequestConfig } from 'axios';
import * as fs from 'fs';
import { errFunc } from '../error';

const demoUniverstity: any = {
	doc: {
		id: 'did:iota:A2GckZyA8raGrXy8jbf8njU4rRdqhNRn7d1FyjJSU4zB',
		authentication: [
			{
				id: 'did:iota:A2GckZyA8raGrXy8jbf8njU4rRdqhNRn7d1FyjJSU4zB#key',
				controller: 'did:iota:A2GckZyA8raGrXy8jbf8njU4rRdqhNRn7d1FyjJSU4zB',
				type: 'Ed25519VerificationKey2018',
				publicKeyBase58: 'B9Y8ZGrtpKSaWS5MWBvGsFX7CP1ibrmM2mYcY8fXRK5B'
			}
		],
		created: '2021-07-06T11:40:44Z',
		updated: '2021-07-06T11:40:44Z',
		proof: {
			type: 'JcsEd25519Signature2020',
			verificationMethod: '#key',
			signatureValue: '3KZK7Gm3vXQ81Z9BnET5kQCemrw6kRRLPZNxD3ePb4YkBpwAACzC5jDbGMszYMYKwovUvKthxYRHiFKDYwZ62Qnd'
		}
	},
	key: {
		type: 'ed25519',
		public: 'B9Y8ZGrtpKSaWS5MWBvGsFX7CP1ibrmM2mYcY8fXRK5B',
		secret: '6Dcm7nGLXfzqjxa4geRNJT6sdVxsseyYHS5D587pBuHi',
		encoding: 'base58'
	},
	txHash: '4572c30807ce887f0ee10858960621f55598cae9e1914e241ac26ad29c7ed0d0'
};

const identityId = '';

const claim = {
	type: 'ExamRating',
	professor: 'did:iota:123',
	rating: 1.5,
	subject: 'Mathematic',
	topic: 'Probability Calculation'
};

const axiosOptions: AxiosRequestConfig = {
	headers: {
		'Content-Type': 'application/json'
	}
};

axios.interceptors.response.use((response) => response, errFunc(demoUniverstity));

export const issueCredential = async (credentialType, claim, identityId) => {
	console.log('requesting create identity endpoint...');
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

	const body = {
		subject: {
			identityId,
			credentialType,
			claim
		}
	};

	const res = await axios.post(`${Config.baseUrl}/verification/create-credential${apiKey}`, JSON.stringify(body), axiosOptions);
	console.log(`received status from update user endpoint: ${res?.status}`);

	if (res?.status === 201) {
		console.log('successfully created identity!');
		console.log('#####################');
		console.log(JSON.stringify(res.data));
		console.log('#####################');
	}
};

async function run() {
	try {
		await issueCredential('ExamRatingCredential', claim, identityId);
	} catch (e) {
		console.log('e', e);
	}
}

run();
