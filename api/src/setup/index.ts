import * as dotenv from 'dotenv';
dotenv.config();
import { MongoDbService } from '../services/mongodb-service';
import { CONFIG } from '../config';
import { UserService } from '../services/user-service';
import { IdentityService } from '../services/identity-service';
import { AuthenticationService } from '../services/authentication-service';
import { addTrustedRootId } from '../database/trusted-roots';
import { getHexEncodedKey, signNonce, verifySignedNonce } from '../utils/encryption';
import { UserType } from '../models/types/user';
import { CreateIdentityBody } from '../models/types/identity';

const dbUrl = CONFIG.databaseUrl;
const dbName = CONFIG.databaseName;
const serverSecret = CONFIG.serverSecret;
const serverIdentityId = CONFIG.serverIdentityId;

export async function setupApi() {
	console.log(`Setting api please wait...`);
	if (!serverSecret) {
		throw Error('A server secret must be defined to setup the api!');
	}

	await MongoDbService.connect(dbUrl, dbName);
	// TODO create database, documents and indexes in mongodb at the first time!
	// key-collection-links->linkedIdentity (unique + partial {"linkedIdentity":{"$exists":true}})

	const userService = new UserService();
	const identityService = IdentityService.getInstance(CONFIG.identityConfig);
	const tmpAuthenticationService = new AuthenticationService(identityService, userService, {
		jwtExpiration: '2 days',
		serverSecret,
		serverIdentityId
	});

	const serverIdentity = await tmpAuthenticationService.getIdentityFromDb(serverIdentityId);

	if (!serverIdentityId || !serverIdentity) {
		console.log('Create identity...');
		// TODO#94 make it dynamic
		const serverData: CreateIdentityBody = {
			storeIdentity: true,
			username: 'root-identity',
			type: UserType.Service
		};

		const identity = await tmpAuthenticationService.createIdentity(serverData);

		console.log('==================================================================================================');
		console.log(`== Store this identity in the as ENV var: ${identity.doc.id} ==`);
		console.log('==================================================================================================');

		// re-create the authentication service with a valid server identity id
		const authenticationService = new AuthenticationService(identityService, userService, {
			jwtExpiration: '2 days',
			serverSecret,
			serverIdentityId: identity.doc.id
		});

		const serverUser = await userService.getUser(identity.doc.id);
		if (!serverUser) {
			throw new Error('server user not found!');
		}
		console.log('Add server id as trusted root...');
		await addTrustedRootId(serverUser.userId);

		console.log('Generate key collection...');
		const kc = await authenticationService.generateKeyCollection(serverUser.userId);
		const res = await authenticationService.saveKeyCollection(kc);

		if (!res?.result.n) {
			throw new Error('could not save keycollection!');
		}

		console.log('Set server identity as verified...');
		await authenticationService.verifyUser(serverUser, serverUser.userId, serverUser.userId);
		console.log(`Setup Done!\nPlease store the generated server identity as environment variable.\nLike: SERVER_IDENTITY=${serverUser.userId}`);
		process.exit(0);
	} else {
		// verify if secret key of the server can be used to sign and verify a challenge
		// if the secret key was changed the server won't be able to decrypt the secret key of the server
		// and thus is not able to verify the challenge
		console.log('Check if server has valid keypair...');
		const challenge = 'test-challenge-to-solve';
		let verified = false;
		try {
			const signedChallenge = await signNonce(getHexEncodedKey(serverIdentity.key.secret), challenge);
			verified = await verifySignedNonce(getHexEncodedKey(serverIdentity.key.public), challenge, signedChallenge);
		} catch (e) {
			console.error('error when signing or verifying the challenge, the secret key might have changed...');
		}
		if (!verified) {
			throw new Error('server keys cannot be verified!');
		}
		console.log('Api is ready to use!');
	}
}
