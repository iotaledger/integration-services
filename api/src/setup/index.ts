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
import { getServerIdentity } from '../database/user';
import { IConfigurationService } from '../services/configuration-service';
import { Config } from '../models/config/index';
import { getIdentity } from '../database/identity-docs';

const logger = Logger.getInstance();

export class KeyGenerator {
	private readonly config: Config;
	constructor(private readonly configService: IConfigurationService) {
		this.config = configService.config;
		if (!this.config.serverSecret) {
			throw Error('A server secret must be defined to work with the API!');
		}
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

	private async getRootIdentityFromId(serverIdentityId: string): Promise<IdentityJsonUpdate> {
		// TODO #254 create initial documents and indexes in mongodb if they are missing on first initialization.
		// key-collection-links->linkedIdentity (unique + partial {"linkedIdentity":{"$exists":true}})

		return await getIdentity(serverIdentityId, this.config.serverSecret);
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

		const serverIdentityId = rootServerIdentities[0]?.identityId;

		if (serverIdentityId) {
			this.configService.serverIdentityId = serverIdentityId;
			logger.error('Root identity already exists: verify data');
			const serverIdentity = await this.getRootIdentityFromId(serverIdentityId);
			if (serverIdentity) {
				if (this.verifyIdentity(serverIdentity)) {
					logger.log('Root identity is already defined and valid');
					logger.log('No need to create a root identity');
				} else {
					logger.error('Root identity malformed or not valid: ' + serverIdentityId);
					logger.error('Database could be tampered');
				}
			} else {
				logger.error('Error getting data from db');
			}
			return;
		}

		const serverData: CreateIdentityBody = serverIdentityJson;

		const ssiService = SsiService.getInstance(this.config.identityConfig, logger);
		const userService = new UserService(ssiService, this.config.serverSecret, logger);
		const identity = await userService.createIdentity(serverData);

		this.configService.serverIdentityId = identity.doc.id;

		console.log('this.configService.serverIdentityIdthis.configService.serverIdentityId', this.configService.serverIdentityId);

		// re-create the verification service with a valid server identity id
		const verificationService = new VerificationService(
			ssiService,
			userService,
			{
				serverSecret: this.config.serverSecret,
				keyCollectionSize: KEY_COLLECTION_SIZE
			},
			logger,
			this.configService
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
