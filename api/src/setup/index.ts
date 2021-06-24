import * as dotenv from 'dotenv';
dotenv.config();
import { MongoDbService } from '../services/mongodb-service';
import { CONFIG } from '../config';
import { UserService } from '../services/user-service';
import { SsiService } from '../services/ssi-service';
import { VerificationService } from '../services/verification-service';
import { addTrustedRootId } from '../database/trusted-roots';
import { createNonce, getHexEncodedKey, signNonce, verifySignedNonce } from '../utils/encryption';
import { IdentityClaim, UserType } from '../models/types/user';
import { CreateIdentityBody } from '../models/types/identity';
import * as VerifiableCredentialsDb from '../database/verifiable-credentials';
import { KEY_COLLECTION_SIZE } from '../config/identity';
import { CredentialTypes, Subject } from '../models/types/verification';
import { logger } from '../routers/helper';

const dbUrl = CONFIG.databaseUrl;
const dbName = CONFIG.databaseName;
const serverSecret = CONFIG.serverSecret;
const serverIdentityId = CONFIG.serverIdentityId;

export async function setupApi() {
	logger.log(`Setting api please wait...`);
	if (!serverSecret) {
		throw Error('A server secret must be defined to setup the api!');
	}

	await MongoDbService.connect(dbUrl, dbName);
	// TODO create database, documents and indexes in mongodb at the first time!
	// key-collection-links->linkedIdentity (unique + partial {"linkedIdentity":{"$exists":true}})

	const ssiService = SsiService.getInstance(CONFIG.identityConfig, logger);
	const userService = new UserService(ssiService, serverSecret, logger);
	const tmpVerificationService = new VerificationService(
		ssiService,
		userService,
		{
			serverSecret,
			serverIdentityId,
			keyCollectionSize: KEY_COLLECTION_SIZE
		},
		logger
	);

	const serverIdentity = await tmpVerificationService.getIdentityFromDb(serverIdentityId);

	if (!serverIdentityId || !serverIdentity) {
		logger.log('Create identity...');
		// TODO#94 make it dynamic
		const serverData: CreateIdentityBody = {
			storeIdentity: true,
			username: 'root-identity',
			claim: {
				type: UserType.Service,
				name: 'Identity Service'
			} as IdentityClaim
		};

		const identity = await userService.createIdentity(serverData);

		logger.log('==================================================================================================');
		logger.log(`== Store this identity in the as ENV var: ${identity.doc.id} ==`);
		logger.log('==================================================================================================');

		// re-create the verification service with a valid server identity id
		const verificationService = new VerificationService(
			ssiService,
			userService,
			{
				serverSecret,
				serverIdentityId: identity.doc.id,
				keyCollectionSize: KEY_COLLECTION_SIZE
			},
			logger
		);

		const serverUser = await userService.getUser(identity.doc.id);
		if (!serverUser) {
			throw new Error('server user not found!');
		}
		logger.log('Add server id as trusted root...');
		await addTrustedRootId(serverUser.identityId);

		logger.log('Generate key collection...');
		const index = await VerifiableCredentialsDb.getNextCredentialIndex(this.serverIdentityId);
		const keyCollectionIndex = verificationService.getKeyCollectionIndex(index);
		const kc = await verificationService.getKeyCollection(keyCollectionIndex);

		if (!kc) {
			throw new Error('could not create the keycollection!');
		}

		logger.log('Set server identity as verified...');
		const subject: Subject = {
			claim: serverUser.claim,
			credentialType: CredentialTypes.VerifiedIdentityCredential,
			identityId: serverUser.identityId
		};
		await verificationService.verifyIdentity(subject, serverUser.identityId, serverUser.identityId);
		logger.log(`Setup Done!\nPlease store the generated server identity as environment variable.\nLike: SERVER_IDENTITY=${serverUser.identityId}`);
		process.exit(0);
	} else {
		// verify if secret key of the server can be used to sign and verify a challenge
		// if the secret key was changed the server won't be able to decrypt the secret key of the server
		// and thus is not able to verify the challenge
		logger.log('Check if server has valid keypair...');
		const nonce = createNonce();
		let verified = false;
		try {
			const signedNonce = await signNonce(getHexEncodedKey(serverIdentity.key.secret), nonce);
			verified = await verifySignedNonce(getHexEncodedKey(serverIdentity.key.public), nonce, signedNonce);
		} catch (e) {
			logger.error('error when signing or verifying the nonce, the secret key might have changed...');
		}
		if (!verified) {
			throw new Error('server keys cannot be verified!');
		}
		logger.log('Api is ready to use!');
	}
}
