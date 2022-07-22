import { addTrustedRootId, getTrustedRootIds } from '../database/trusted-roots';
import { CreateIdentityBody, IdentityKeys, Subject, CredentialTypes } from '@iota/is-shared-modules';
import { createNonce, signNonce, getHexEncodedKey, verifySignedNonce } from '@iota/is-shared-modules/node';
import { UserService } from '../services/user-service';
import { VerificationService } from '../services/verification-service';
import * as serverIdentityJson from '../config/server-identity.json';
import * as VerifiableCredentialsDb from '../database/verifiable-credentials';
import { SsiService } from '../services/ssi-service';
import { getServerIdentities } from '../database/user';
import { IConfigurationService } from '../services/configuration-service';
import { Config } from '../models/config/index';
import { getIdentityKeys } from '../database/identity-keys';
import { ILogger } from '../utils/logger';

export class KeyGenerator {
	private readonly config: Config;
	constructor(private readonly configService: IConfigurationService, private readonly logger: ILogger) {
		this.config = configService.config;
		if (!this.config.serverSecret) {
			throw Error('A server secret must be defined to work with the API!');
		}
	}

	// Check if identity is a valid one
	private async verifyIdentity(serverIdentity: IdentityKeys): Promise<boolean> {
		// verify if secret key of the server can be used to sign and verify a challenge
		// if the secret key was changed the server won't be able to decrypt the secret key of the server
		// and thus is not able to verify the challenge
		const nonce = createNonce();
		let verified = false;
		try {
			const signedNonce = await signNonce(getHexEncodedKey(serverIdentity.keys.sign.private), nonce);
			verified = await verifySignedNonce(getHexEncodedKey(serverIdentity.keys.sign.public), nonce, signedNonce);
		} catch (e) {
			this.logger.error('error when signing or verifying the nonce, the secret key might have changed...');
		}
		return verified;
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

		let serverIdentityId = rootServerIdentities[0]?.id;
		let serverIdentityKeys;
		if (serverIdentityId) {
			this.configService.serverIdentityId = serverIdentityId;
			this.logger.log('Root identity already exists: verify data');
			serverIdentityKeys = await getIdentityKeys(serverIdentityId, this.config.serverSecret);
			if (serverIdentityKeys) {
				const isValid = await this.verifyIdentity(serverIdentityKeys);

				if (isValid) {
					this.logger.log('Root identity is already defined and valid');
					this.logger.log('No need to create a root identity');
				} else {
					this.logger.error('Root identity malformed or not valid: ' + serverIdentityId);
					this.logger.error('Database could be tampered');
					return;
				}
			} else {
				this.logger.error('Error getting data from db');
				return;
			}
		}

		const serverData: CreateIdentityBody = serverIdentityJson;

		const ssiService = SsiService.getInstance(this.config.identityConfig, this.logger);
		const userService = new UserService(ssiService, this.config.serverSecret, this.logger);

		if (!serverIdentityKeys) {
			this.logger.log('creating the server identity...');
			const newIdentity = await userService.createIdentity(serverData);
			serverIdentityId = newIdentity.id;
			this.configService.serverIdentityId = serverIdentityId;
			this.logger.log(JSON.stringify(newIdentity));
		}

		// create the verification service with a valid server identity id
		const verificationService = new VerificationService(ssiService, userService, this.logger, this.configService);
		const serverUser = await userService.getUser(serverIdentityId);

		if (!serverUser) {
			throw new Error('server user not found!');
		}

		this.logger.log('Add server id as trusted root...');
		const rootIds = await getTrustedRootIds();
		if (rootIds.find((r) => r.id == serverUser.id) == null) {
			await addTrustedRootId(serverUser.id);
		}

		this.logger.log('Generate bitmap...');
		const index = await VerifiableCredentialsDb.getNextCredentialIndex(serverUser.id);
		const bitmapIndex = verificationService.getBitmapIndex(index);
		const bm = await verificationService.getBitmap(bitmapIndex);

		if (!bm) {
			throw new Error('could not create the bitmap!');
		}
		if (!serverUser?.verifiableCredentials || serverUser.verifiableCredentials.length === 0) {
			this.logger.log('Set server identity as verified...');
			const subject: Subject = {
				claim: serverUser.claim,
				credentialType: CredentialTypes.VerifiedIdentityCredential,
				id: serverUser.id
			};

			await verificationService.issueVerifiableCredential(subject, serverUser.id, serverUser.id);
		}
		this.logger.log(`Setup Done!`);
	}
}
