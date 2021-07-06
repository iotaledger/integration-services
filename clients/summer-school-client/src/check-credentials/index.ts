import * as dotenv from 'dotenv';
dotenv.config();
import { Config } from '../config';
import axios from 'axios';
import { AxiosRequestConfig } from 'axios';

const axiosOptions: AxiosRequestConfig = {
	headers: {
		'Content-Type': 'application/json'
	}
};

// 3.1. TODO add your BasicIdentityCredential here like following:
// if you adjust your name or anything below after your credential was issued it is no more valid when checking it
const identityCredential = {
	'@context': 'https://www.w3.org/2018/credentials/v1',
	id: 'did:iota:GmJVcwQXeVMMZajxB4sGeQqXoM9FtbvrwUzwHeBBUyYe',
	type: ['VerifiableCredential', 'BasicIdentityCredential'],
	credentialSubject: {
		id: 'did:iota:GmJVcwQXeVMMZajxB4sGeQqXoM9FtbvrwUzwHeBBUyYe',
		'@context': 'https://schema.org/',
		familyName: 'Buffet',
		givenName: 'Sandra',
		initiatorId: 'did:iota:7Ub2g1fvWfH5pzE6QECwpXFdiVfv3bXaWBDwJFXM8aGs',
		name: 'Sandra Buffet',
		type: 'Person'
	},
	issuer: 'did:iota:FSAMVdZqbUTaTHnL6yNGzPzuxTNLuE5VEbz7SndkgYCP',
	issuanceDate: '2021-07-06T13:01:27Z',
	proof: {
		type: 'MerkleKeySignature2021',
		verificationMethod: '#key-collection-0',
		signatureValue:
			'3Q43a6jHpjxr5JV56D8QpkbS8KQVxnbcMAd6hakZ31HF.1116NQ84sQfXXvLK2t6S5ZrKJGqZfWvwGQzZQ24dZTp9WweeQadgQALKrPXPmgqDQKzBZuKemeZ8Y3THmQqkz46k8yktz1QD4roctQsDExcdtrbP2H5TrX4ZQf8kF53b1eMAMm9NLrq3krQFVMiUv24xYTGPJZaqJixh4kptpg5NT9WKUzTVVadqCZxEMiNGSCGNZyxdQ5mm2r9qqEkbXc2xfSFPnRVQv3g6wT2SZRh6Q7fNBm8HPGCvfd8CTz7JcDzpjQk8K6Xm8sHV2qXi2WrngnjQKH5rHTyFf6cSHcJfrTtzEFun3QTgVNJYrykwfXqg7RvC4sbwgeJnPgexRyrg7HGookQmJ8okaFwFWEMJwwdMH6CVQG17Zh1fpZymWcTLnszCsUkinhCLLLXzC1Mcts6ve9ApTKcK1cbHGBo2RJPZTqd13mcx4niFZADVBnYt2xGefvtMptf7he5vsAnsJmCNyZPB1LUA6pfuVsyHzy2NWQqYZBmn65BUB8VTixEms1EoJMMESwsripMBkFbmkTdKMgJsS.5uyDc2NNSN5ZXuUJJnMW3hr1rMtxMPy5WHGxaFhPZg5L9ZL5LfKLEm1LQZSnsnFShn38T3EvmiiAXjKDmijhNwKQ'
	}
};

// TODO 3.2. add your ExamRatingCredential here like following
// if you adjust your grade or anything below after your credential was issued it is no more valid when checking it
const examCredential = {
	'@context': 'https://www.w3.org/2018/credentials/v1',
	id: 'did:iota:GmJVcwQXeVMMZajxB4sGeQqXoM9FtbvrwUzwHeBBUyYe',
	type: ['VerifiableCredential', 'ExamRatingCredential'],
	credentialSubject: {
		id: 'did:iota:GmJVcwQXeVMMZajxB4sGeQqXoM9FtbvrwUzwHeBBUyYe',
		initiatorId: 'did:iota:7Ub2g1fvWfH5pzE6QECwpXFdiVfv3bXaWBDwJFXM8aGs',
		professor: 'did:iota:123',
		rating: 1.5,
		subject: 'Mathematic',
		topic: 'Probability Calculation',
		type: 'ExamRating'
	},
	issuer: 'did:iota:FSAMVdZqbUTaTHnL6yNGzPzuxTNLuE5VEbz7SndkgYCP',
	issuanceDate: '2021-07-06T13:01:30Z',
	proof: {
		type: 'MerkleKeySignature2021',
		verificationMethod: '#key-collection-0',
		signatureValue:
			'8bgS2NVwkmhb4Z5YSDu6KXoxDjUcZhn6Ew7Jivx57iUy.1116m5D3w7AaKDJTGGG7Y41LoB4qGyYGBedpS5b6hRmp18xLKnd9S9ddyADGSn89T3LV71eHHRDphAdwbPx9k3QcgMn2feGWnZxHufmGRCcNAvXEj2XUX6hWd8furUeCMmZLvWSzMJnbWYEV39t6h2QQKhcC53xRcSdGyR9GCPQtvtn8aiTwDpPUUisdxbPzFLmMptZNZ6gMFBLV72RZpM5F3fQND8uG28NLLNDfxa6ytSsxMbo6PMj4XFScpnPif3KoZkAmQ5rtWr7LZNJF1g8SKkUcUdba9Pq7urB7FhfRzXUs3afATCdq5eefB9nmLNx8fiH4xNnwNtdz8yMasWz2frCHfDF8n7GKk8SJtChrP7gkcAjqHMYX9YssBRNwGFuTrMVW9xBwcdinmW5p8T28ESynDFh2CBhHJV6nL6smKpDTNiW4jvaKzh51gkaqSgoaFFYSNHFiKqaPkKrDWfjUicoh1jkfCBKtu3TV95rBmYzL8Po6sTsLiLtWXy2hb3yZQ5SPSJuaVP1NSgDsDnwZi4hz7WfEQ.613vyw35Ny5nXDv77FniHGAsY5u6tLjsPfbijHdT2rrpWVXeyEKjACmK31RHgJoba4gN3BfahReMwejLn35CE5Z5'
	}
};

export const checkCredential = async (credential) => {
	console.log('Checking the credential:', credential?.type?.[1]);
	const apiKey = Config.apiKey ? `?api-key=${Config.apiKey}` : '';

	const res = await axios.post(`${Config.baseUrl}/verification/check-credential${apiKey}`, JSON.stringify(credential), axiosOptions);

	if (res?.status === 200) {
		console.log(JSON.stringify(res.data));
		return res?.data?.isVerified;
	}
	return false;
};

async function run() {
	try {
		// here both credentials will be checked
		const isVerifiedIdentity = await checkCredential(identityCredential);
		const isVerifiedExam = await checkCredential(examCredential);

		// if both credentials are valid
		if (isVerifiedIdentity && isVerifiedExam) {
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('Both credentials are valid!');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		} else {
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('There is an invalid credential!');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		}
	} catch (e) {
		console.log(e);
	}
}

run();
