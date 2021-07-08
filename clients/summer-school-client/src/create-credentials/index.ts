import * as dotenv from 'dotenv';
dotenv.config();
import { Config } from '../config';
import axios, { AxiosRequestConfig } from 'axios';
import * as fs from 'fs';
import { errFunc } from '../error';

const axiosOptions: AxiosRequestConfig = {
	headers: {
		'Content-Type': 'application/json'
	}
};

// this is the identity of the professor which issues the credentials (do not edit this one)
const issuer: any = {
	doc: {
		id: 'did:iota:7Ub2g1fvWfH5pzE6QECwpXFdiVfv3bXaWBDwJFXM8aGs',
		authentication: [
			{
				id: 'did:iota:7Ub2g1fvWfH5pzE6QECwpXFdiVfv3bXaWBDwJFXM8aGs#key',
				controller: 'did:iota:7Ub2g1fvWfH5pzE6QECwpXFdiVfv3bXaWBDwJFXM8aGs',
				type: 'Ed25519VerificationKey2018',
				publicKeyBase58: '7wiY9DJqwbJw9nsPbmHtWa29e2wRrhKNi7zKCckKxn7J'
			}
		],
		created: '2021-07-06T12:43:45Z',
		updated: '2021-07-06T12:43:45Z',
		proof: {
			type: 'JcsEd25519Signature2020',
			verificationMethod: '#key',
			signatureValue: 'ce9Kp1iry1mW1YKXKnPMfW85XEPU4By7M8xz9zBXtLL3v5624AkbrYUJoZXYhYDfRUCmdi8dztW2LV7NvfUjpas'
		}
	},
	key: {
		type: 'ed25519',
		public: '7wiY9DJqwbJw9nsPbmHtWa29e2wRrhKNi7zKCckKxn7J',
		secret: '7nHsvwVZZZnWefuQP6TkWhKXHCxwEBEwnCVTUJL9M1uk',
		encoding: 'base58'
	},
	txHash: '3ff462507b8bd07673f2f3045a0eb128301f04f261287686f0c72e03de31807a'
};

// this is the verifiable credential of the professor (do not edit this one)
const initiatorVC = {
	'@context': 'https://www.w3.org/2018/credentials/v1',
	id: 'did:iota:7Ub2g1fvWfH5pzE6QECwpXFdiVfv3bXaWBDwJFXM8aGs',
	type: ['VerifiableCredential', 'VerifiedIdentityCredential'],
	credentialSubject: {
		id: 'did:iota:7Ub2g1fvWfH5pzE6QECwpXFdiVfv3bXaWBDwJFXM8aGs',
		'@context': 'https://schema.org/',
		description: 'This is is a professor which signs demo credentials for its students.',
		familyName: 'Theiss',
		givenName: 'Raphael',
		initiatorId: 'did:iota:3d2aY6ok7z6oHdGHVoPSnmXizn18S3Y7VEY4GH7ecsis',
		name: 'Prof. Dr. Raphael Theiss',
		type: 'Person',
		worksFor: 'did:iota:7ppMNQEuqngCuBRMh9qTtinCQUnLxrgAQGihFSa8P8MF'
	},
	issuer: 'did:iota:FSAMVdZqbUTaTHnL6yNGzPzuxTNLuE5VEbz7SndkgYCP',
	issuanceDate: '2021-07-06T12:44:26Z',
	proof: {
		type: 'MerkleKeySignature2021',
		verificationMethod: '#key-collection-0',
		signatureValue:
			'bkbhRJLsjs9Dsd6pXhGkx8LbJFX3TkSo8wQitzDUevZ.1116NNipdZaEj4Teu6ELgbf8DNG7otr8KU6tmeGYqBFvDMXfgZfa38MvixYqFvbV4itcpAGEVMM1C21JnsRhbQD8fZDiwpJX9wekQkXDsc47P8yWVcAbCZTpes5SfCiAxGuzADceNyR7qxJArc2QjgcCieS59NX5tAEUQmqThdRCULC1A4wE89peuBYL3p9ri1omSG3r2dkTgbTB5KRUgzJbL6RzdnzASkLYsxHc74jJVLhKjsxFtxduwSbShmDxHsdMVXcvk27xKyK2cCfvWqBJaKhLqyLdLoW9FaXfXyZoSRUkb5JBeefAoV9cufsoio6eEP1yE9DXA2fDHw59tpUx6SUBiDbAg5FvepB3eu6CuwR8VAMkYTJ25UNn4bup3EVnUk9SNgr2c8eHjF5giBhWSbmdCQSfZEbHknAbDidjBUpMsFPhmXU8TXCDMqggcVhSPFm9N3aWK3w94eXf7RRsKVLUqJUkCyAWn7YisfxnRnMhJzBzbf8YkTH9m6TyJvmP8wmtpqGXjbR1audhp73z7zwtyC1L4.WNgxwoqC4WvkW6ELiDfHLEE6hD2wz6RLdfrwp6NexWvrDxQh2UWzuuzgFz8X8rLtCKSL1Zpw5XguJDnGe25qut6'
	}
};

// TODO 2.1. add your identity here
const identityId = 'did:iota:Hdrd2WEUzcMqHpMG9fReQbgpRjysCL2vTain345PpNCY';

// TODO 2.2. add your claim about your person here
const identityClaim = {
	type: 'Person',
	name: 'Sandra Buffet',
	familyName: 'Buffet',
	givenName: 'Sandra'
};

// This is the grade for the exam
const examClaim = {
	type: 'ExamRating',
	professor: 'did:iota:123',
	grade: 1.5, // TODO 2.3. you can adjust your grade before creating the credential
	subject: 'Mathematic',
	topic: 'Probability Calculation'
};

axios.interceptors.response.use((response) => response, errFunc(issuer));

export const issueCredential = async (credentialType, claim, identityId) => {
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

	const body = {
		subject: {
			identityId,
			credentialType,
			claim
		},
		initiatorVC
	};

	const res = await axios.post(`${Config.baseUrl}/verification/create-credential${apiKey}`, JSON.stringify(body), axiosOptions);

	if (res?.status === 200) {
		console.log('successfully signed credential!');
		console.log('#####################');
		console.log(JSON.stringify(res.data));
		try {
			fs.writeFileSync('./src/create-credentials/' + credentialType + '.json', JSON.stringify(res.data));
		} catch (e) {
			console.log(e);
		}
		console.log('#####################');
	}
};

async function run() {
	try {
		await issueCredential('BasicIdentityCredential', identityClaim, identityId);
		await issueCredential('ExamRatingCredential', examClaim, identityId);
	} catch (e) {
		console.log(e);
	}
}

run();
