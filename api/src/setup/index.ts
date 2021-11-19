import { addTrustedRootId } from '../database/trusted-roots';
import { IdentityJsonUpdate, CreateIdentityBody } from '../models/types/identity';
import { Subject, CredentialTypes } from '../models/types/verification';
import { UserService } from '../services/user-service';
import { VerificationService } from '../services/verification-service';
import { createNonce, signNonce, getHexEncodedKey, verifySignedNonce } from '../utils/encryption';
import { Logger } from '../utils/logger';

import * as serverIdentityJson from '../config/server-identity.json';
import * as VerifiableCredentialsDb from '../database/verifiable-credentials';
import { SsiService } from '../services/ssi-service';
import { KEY_COLLECTION_SIZE } from '../config/identity';
import { Config } from '../models/config';
import { getServerIdentity } from '../database/user';
import { SERVER_IDENTITY } from '../config/server';

const logger = Logger.getInstance();

export class KeyGenerator {
	private config: Config;

	constructor(config: Config) {
		this.config = config;
		if (!this.config.serverSecret) {
			throw Error('A server secret must be defined to work with the API!');
		}
	}

	// Ensure that on the db there is the declared root identity
	static async checkRootIdentity(config: Config): Promise<IdentityJsonUpdate> {
		logger.log(`Checking root identity...`);
		
		const rootServerIdentities = await getServerIdentity();
		if (!rootServerIdentities || rootServerIdentities.length == 0) {
			logger.error('Root identity is missing');
			return null;
		}

		if (rootServerIdentities.length > 1) {
			logger.error(`Database is in bad state: found ${rootServerIdentities.length} root identities`);
			return null;
		}

		const rootServerIdentity = rootServerIdentities[0];
		const serverIdentityId = rootServerIdentity?.identityId;

		SERVER_IDENTITY.serverIdentity = serverIdentityId;

		const ssiService = SsiService.getInstance(config.identityConfig, logger);
		const userService = new UserService(ssiService, config.serverSecret, logger);

		const tmpVerificationService = new VerificationService(
			ssiService,
			userService,
			{
				serverSecret: config.serverSecret,
				keyCollectionSize: KEY_COLLECTION_SIZE
			},
			logger
		);

		const serverIdentity = await tmpVerificationService.getIdentityFromDb(serverIdentityId);

		if (!serverIdentity) {
			throw Error('Root identity not found in database: ' + serverIdentityId);
		}

		return serverIdentity;
	}

	// Check if identity is a valid one
	private async verifyIdentity(serverIdentity: IdentityJsonUpdate) {
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
			throw Error('server keys cannot be verified!');
		}

		logger.log('Api is ready to use!');
	}

	private async getRootIdentityFromId(): Promise<IdentityJsonUpdate> {
		// TODO #254 create initial documents and indexes in mongodb if they are missing on first initialization.
		// key-collection-links->linkedIdentity (unique + partial {"linkedIdentity":{"$exists":true}})

		const ssiService = SsiService.getInstance(this.config.identityConfig, logger);
		const userService = new UserService(ssiService, this.config.serverSecret, logger);
		const tmpVerificationService = new VerificationService(
			ssiService,
			userService,
			{
				serverSecret: this.config.serverSecret,
				keyCollectionSize: KEY_COLLECTION_SIZE
			},
			logger
		);

		return await tmpVerificationService.getIdentityFromDb(SERVER_IDENTITY.serverIdentity);
	}

	// Setup root identity
	async keyGeneration() {

		logger.log(`Setting root identity please wait...`);

		// Check if root identity exists and if it is valid
		logger.log(`Verify if root identity already exists...`);
		const rootServerIdentities = await getServerIdentity();

		if (rootServerIdentities && rootServerIdentities.length > 1) {
			throw new Error(`Database is in bad state: found ${rootServerIdentities.length} root identities`);
		}

		const rootIdentity = rootServerIdentities[0]?.identityId;

		if (rootIdentity) {
			SERVER_IDENTITY.serverIdentity = rootIdentity;
			logger.error('Root identity already exists: verify data');
			const serverIdentity = await this.getRootIdentityFromId();
			if (serverIdentity) {
				if (this.verifyIdentity(serverIdentity)) {
					logger.log('Root identity is already defined and valid');
					logger.log('No need to create a root identity');
				}
				else {
					logger.error('Root identity malformed or not valid: ' + rootIdentity);
					logger.error('Database could be tampered');
				}
			}
			else {
				logger.error('Error getting data from db');
			}
			return;
		}

		const serverData: CreateIdentityBody = serverIdentityJson;

		const ssiService = SsiService.getInstance(this.config.identityConfig, logger);
		const userService = new UserService(ssiService, this.config.serverSecret, logger);
		const identity = await userService.createIdentity(serverData);

		SERVER_IDENTITY.serverIdentity = identity.doc.id;
		
		// re-create the verification service with a valid server identity id
		const verificationService = new VerificationService(
			ssiService,
			userService,
			{
				serverSecret: this.config.serverSecret,
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
		const index = await VerifiableCredentialsDb.getNextCredentialIndex(serverUser.identityId);
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

		logger.log(`Setup Done!`);
	}
}
