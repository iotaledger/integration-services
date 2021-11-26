import { addTrustedRootId } from '../database/trusted-roots';
import { IdentityJsonUpdate, CreateIdentityBody } from '../models/types/identity';
import { Subject, CredentialTypes } from '../models/types/verification';
import { UserService } from '../services/user-service';
import { VerificationService } from '../services/verification-service';
import { createNonce, signNonce, getHexEncodedKey, verifySignedNonce } from '../utils/encryption';

import * as serverIdentityJson from '../config/server-identity.json';
import * as VerifiableCredentialsDb from '../database/verifiable-credentials';
import { SsiService } from '../services/ssi-service';
import { getServerIdentities } from '../database/user';
import { IConfigurationService } from '../services/configuration-service';
import { Config } from '../models/config/index';
import { getIdentityDoc } from '../database/identity-docs';
import { ILogger } from '../utils/logger/index';

export class KeyGenerator {
	private readonly config: Config;
	constructor(private readonly configService: IConfigurationService, private readonly logger: ILogger) {
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
		this.logger.log('Check if server has valid keypair...');
		const nonce = createNonce();
		let verified = false;
		try {
			const signedNonce = await signNonce(getHexEncodedKey(serverIdentity.key.secret), nonce);
			verified = await verifySignedNonce(getHexEncodedKey(serverIdentity.key.public), nonce, signedNonce);
		} catch (e) {
			this.logger.error('error when signing or verifying the nonce, the secret key might have changed...');
		}
		if (!verified) {
			throw Error('server keys cannot be verified!');
		}

		this.logger.log('Api is ready to use!');
	}

	// Setup root identity
	async keyGeneration() {
		this.logger.log(`Setting root identity please wait...`);

		// Check if root identity exists and if it is valid
		this.logger.log(`Verify if root identity already exists...`);
		const rootServerIdentities = await getServerIdentities();

		if (rootServerIdentities && rootServerIdentities.length > 1) {
			throw new Error(`Database is in bad state: found ${rootServerIdentities.length} root identities`);
		}

		const serverIdentityId = rootServerIdentities[0]?.identityId;

		if (serverIdentityId) {
			this.configService.serverIdentityId = serverIdentityId;
			this.logger.error('Root identity already exists: verify data');
			const serverIdentity = await getIdentityDoc(serverIdentityId, this.config.serverSecret);
			if (serverIdentity) {
				if (this.verifyIdentity(serverIdentity)) {
					this.logger.log('Root identity is already defined and valid');
					this.logger.log('No need to create a root identity');
				} else {
					this.logger.error('Root identity malformed or not valid: ' + serverIdentityId);
					this.logger.error('Database could be tampered');
				}
			} else {
				this.logger.error('Error getting data from db');
			}
			return;
		}

		const serverData: CreateIdentityBody = serverIdentityJson;

		const ssiService = SsiService.getInstance(this.config.identityConfig, this.logger);
		const userService = new UserService(ssiService, this.config.serverSecret, this.logger);
		const identity = await userService.createIdentity(serverData);

		this.configService.serverIdentityId = identity.doc.id;

		// create the verification service with a valid server identity id
		const verificationService = new VerificationService(ssiService, userService, this.logger, this.configService);

		const serverUser = await userService.getUser(identity.doc.id);

		if (!serverUser) {
			throw new Error('server user not found!');
		}

		this.logger.log('Add server id as trusted root...');
		await addTrustedRootId(serverUser.identityId);

		this.logger.log('Generate key collection...');
		const index = await VerifiableCredentialsDb.getNextCredentialIndex(serverUser.identityId);
		const keyCollectionIndex = verificationService.getKeyCollectionIndex(index);
		const kc = await verificationService.getKeyCollection(keyCollectionIndex);

		if (!kc) {
			throw new Error('could not create the keycollection!');
		}

		this.logger.log('Set server identity as verified...');
		const subject: Subject = {
			claim: serverUser.claim,
			credentialType: CredentialTypes.VerifiedIdentityCredential,
			identityId: serverUser.identityId
		};

		await verificationService.verifyIdentity(subject, serverUser.identityId, serverUser.identityId);

		this.logger.log(`Setup Done!`);
	}
}
