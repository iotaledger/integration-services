import { KeyCollectionJson, KeyCollectionPersistence, VerifiableCredentialPersistence } from '../models/types/key-collection';
import { CredentialSubject, VerifiableCredentialJson, Credential, IdentityKeys } from '../models/types/identity';
import { SsiService } from './ssi-service';
import { UserService } from './user-service';
import * as KeyCollectionDb from '../database/key-collection';
import * as VerifiableCredentialsDb from '../database/verifiable-credentials';
import * as IdentityDocsDb from '../database/identity-keys';
import * as TrustedRootsDb from '../database/trusted-roots';
import { JsonldGenerator } from '../utils/jsonld';
import { Subject } from '../models/types/verification';
import { ILogger } from '../utils/logger';
import { ILock, Lock } from '../utils/lock';
import { IConfigurationService } from './configuration-service';

export class VerificationService {
	private noIssuerFoundErrMessage = (issuerId: string) => `No identity found for issuerId: ${issuerId}`;
	private readonly serverSecret: string;
	private readonly keyCollectionSize: number;
	private readonly lock: ILock;

	constructor(
		private readonly ssiService: SsiService,
		private readonly userService: UserService,
		private readonly logger: ILogger,
		private readonly configService: IConfigurationService
	) {
		this.serverSecret = this.configService.config.serverSecret;
		this.keyCollectionSize = this.configService.identityConfig.keyCollectionSize;
		this.lock = Lock.getInstance();
	}

	async getKeyCollection(keyCollectionIndex: number) {
		let keyCollection = await KeyCollectionDb.getKeyCollection(keyCollectionIndex, this.configService.serverIdentityId, this.serverSecret);
		if (!keyCollection) {
			keyCollection = await this.generateKeyCollection(keyCollectionIndex, this.keyCollectionSize, this.configService.serverIdentityId);
			const res = await KeyCollectionDb.saveKeyCollection(keyCollection, this.configService.serverIdentityId, this.serverSecret);

			if (!res?.result.n) {
				throw new Error('could not save keycollection!');
			}
		}
		return keyCollection;
	}

	async getIdentityFromDb(did: string): Promise<IdentityKeys> {
		return IdentityDocsDb.getIdentityKeys(did, this.serverSecret);
	}

	async issueVerifiableCredential(subject: Subject, issuerId: string, initiatorId: string) {
		const jsonldGen = new JsonldGenerator();
		const claim = jsonldGen.jsonldUserData(subject.claim.type, subject.claim);

		const credential: Credential<CredentialSubject> = {
			type: subject.credentialType,
			id: subject.id,
			subject: {
				...claim,
				type: subject.claim.type,
				id: subject.id,
				initiatorId
			}
		};

		const currentCredentialIndex = await VerifiableCredentialsDb.getNextCredentialIndex(this.configService.serverIdentityId);
		const keyCollectionIndex = this.getKeyCollectionIndex(currentCredentialIndex);
		const keyCollection = await this.getKeyCollection(keyCollectionIndex);
		const nextCredentialIndex = await VerifiableCredentialsDb.getNextCredentialIndex(this.configService.serverIdentityId);
		const keyIndex = nextCredentialIndex % this.keyCollectionSize;
		const keyCollectionJson: KeyCollectionJson = {
			type: keyCollection.type,
			keys: keyCollection.keys,
			publicKeyBase58: keyCollection.publicKeyBase58
		};

		const identityKeys: IdentityKeys = await IdentityDocsDb.getIdentityKeys(issuerId, this.serverSecret);
		if (!identityKeys) {
			throw new Error(this.noIssuerFoundErrMessage(issuerId));
		}
		const vc = await this.ssiService.createVerifiableCredential<CredentialSubject>(
			identityKeys,
			credential,
			keyCollectionJson,
			keyCollectionIndex,
			keyIndex
		);

		await VerifiableCredentialsDb.addVerifiableCredential(
			{
				vc,
				index: nextCredentialIndex,
				initiatorId,
				isRevoked: false
			},
			this.configService.serverIdentityId
		);

		await this.setUserVerified(credential.id, identityKeys.id, vc);
		return vc;
	}

	async checkVerifiableCredential(vc: VerifiableCredentialJson): Promise<boolean> {
		const serverIdentity: IdentityKeys = await IdentityDocsDb.getIdentityKeys(this.configService.serverIdentityId, this.serverSecret);
		if (!serverIdentity) {
			throw new Error('no valid server identity to check the credential.');
		}
		const isVerifiedCredential = await this.ssiService.checkVerifiableCredential(vc);
		const trustedRoots = await this.getTrustedRootIds();

		const isTrustedIssuer = trustedRoots && trustedRoots.some((rootId) => rootId === vc.issuer);
		const isVerified = isVerifiedCredential && isTrustedIssuer;
		return isVerified;
	}

	async revokeVerifiableCredentials(id: string) {
		const credentials = await VerifiableCredentialsDb.getVerifiableCredentials(id);
		if (!credentials || credentials.length === 0) {
			return;
		}

		return await Promise.all(
			credentials
				.filter((c) => !c.isRevoked)
				.map(async (credential: VerifiableCredentialPersistence) => {
					try {
						return await this.revokeVerifiableCredential(credential, credential?.vc?.issuer);
					} catch (e) {
						this.logger.error('could not revoke credential: ' + credential?.vc?.proof?.signatureValue);
					}
				})
		);
	}

	async revokeVerifiableCredential(vcp: VerifiableCredentialPersistence, issuerId: string): Promise<{ revoked: boolean }> {
		const key = 'credentials-' + issuerId;

		return this.lock.acquire(key).then(async (release) => {
			try {
				const subjectId = vcp.vc.id;

				const issuerIdentity: IdentityKeys = await IdentityDocsDb.getIdentityKeys(issuerId, this.serverSecret);
				if (!issuerIdentity) {
					throw new Error(this.noIssuerFoundErrMessage(issuerId));
				}
				const keyCollectionIndex = this.getKeyCollectionIndex(vcp.index);
				const keyIndex = vcp.index % this.keyCollectionSize;

				const res = await this.ssiService.revokeVerifiableCredential(issuerIdentity, keyCollectionIndex, keyIndex);

				if (res.revoked !== true) {
					this.logger.error(`could not revoke identity for ${subjectId} on the ledger, maybe it is already revoked!`);
					return;
				}

				await VerifiableCredentialsDb.revokeVerifiableCredential(vcp, this.configService.serverIdentityId);
				await this.userService.removeUserVC(vcp.vc);

				return res;
			} finally {
				release();
			}
		});
	}

	async getLatestDocument(did: string) {
		return await this.ssiService.getLatestIdentityJson(did);
	}

	async getTrustedRootIds() {
		const trustedRoots = await TrustedRootsDb.getTrustedRootIds();

		if (!trustedRoots || trustedRoots.length === 0) {
			throw new Error('no trusted roots found!');
		}

		return trustedRoots.map((root) => root.id);
	}

	async addTrustedRootId(trustedRootId: string) {
		return TrustedRootsDb.addTrustedRootId(trustedRootId);
	}

	async removeTrustedRootId(trustedRootId: string) {
		return TrustedRootsDb.removeTrustedRootId(trustedRootId);
	}

	async setUserVerified(id: string, issuerId: string, vc: VerifiableCredentialJson) {
		if (!issuerId) {
			throw new Error('No valid issuer id!');
		}
		await this.userService.addUserVC(vc);
	}

	getKeyCollectionIndex = (currentCredentialIndex: number) => Math.floor(currentCredentialIndex / this.keyCollectionSize);

	private async generateKeyCollection(
		keyCollectionIndex: number,
		keyCollectionSize: number,
		issuerId: string
	): Promise<KeyCollectionPersistence> {
		try {
			const issuerIdentity: IdentityKeys = await IdentityDocsDb.getIdentityKeys(issuerId, this.serverSecret);

			if (!issuerIdentity) {
				throw new Error(this.noIssuerFoundErrMessage(issuerId));
			}

			const { keyCollectionJson } = await this.ssiService.generateKeyCollection(keyCollectionIndex, keyCollectionSize, issuerIdentity);

			return {
				...keyCollectionJson,
				count: keyCollectionSize,
				index: keyCollectionIndex
			};
		} catch (e) {
			this.logger.error(`error when generating key collection ${e}`);
			throw new Error('could not generate key collection');
		}
	}
}
