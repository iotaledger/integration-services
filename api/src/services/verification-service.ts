import { KEY_COLLECTION_SIZE } from '../config/identity';
import { KeyCollectionJson, KeyCollectionPersistence, VerifiableCredentialPersistence } from '../models/types/key-collection';
import {
	CredentialSubject,
	DocumentJsonUpdate,
	IdentityJson,
	IdentityJsonUpdate,
	VerifiableCredentialJson,
	Credential
} from '../models/types/identity';
import { SsiService } from './ssi-service';
import { UserService } from './user-service';
import * as KeyCollectionDb from '../database/key-collection';
import * as VerifiableCredentialsDb from '../database/verifiable-credentials';
import * as IdentityDocsDb from '../database/identity-docs';
import * as TrustedRootsDb from '../database/trusted-roots';
import { VerificationServiceConfig } from '../models/config/services';
import { JsonldGenerator } from '../utils/jsonld';
import { Subject } from '../models/types/verification';
import { ILogger } from '../utils/logger';

export class VerificationService {
	private noIssuerFoundErrMessage = (issuerId: string) => `No identiity found for issuerId: ${issuerId}`;
	private readonly serverSecret: string;
	private readonly keyCollectionSize: number;
	private readonly serverIdentityId: string;

	constructor(
		private readonly ssiService: SsiService,
		private readonly userService: UserService,
		verificationServiceConfig: VerificationServiceConfig,
		private readonly logger: ILogger
	) {
		const { serverSecret, serverIdentityId, keyCollectionSize } = verificationServiceConfig;
		this.serverSecret = serverSecret;
		this.keyCollectionSize = keyCollectionSize;
		this.serverIdentityId = serverIdentityId;
	}

	async getKeyCollection(keyCollectionIndex: number) {
		let keyCollection = await KeyCollectionDb.getKeyCollection(keyCollectionIndex, this.serverIdentityId, this.serverSecret);
		if (!keyCollection) {
			keyCollection = await this.generateKeyCollection(keyCollectionIndex, this.keyCollectionSize, this.serverIdentityId);
			const res = await KeyCollectionDb.saveKeyCollection(keyCollection, this.serverIdentityId, this.serverSecret);

			if (!res?.result.n) {
				throw new Error('could not save keycollection!');
			}
		}
		return keyCollection;
	}

	async getIdentityFromDb(did: string): Promise<IdentityJsonUpdate> {
		return IdentityDocsDb.getIdentity(did, this.serverSecret);
	}

	async verifyIdentity(subject: Subject, issuerId: string, initiatorId: string) {
		const jsonldGen = new JsonldGenerator();
		const claim = jsonldGen.jsonldUserData(subject.claim.type, subject.claim);

		const credential: Credential<CredentialSubject> = {
			type: subject.credentialType,
			id: subject.identityId,
			subject: {
				...claim,
				type: subject.claim.type,
				id: subject.identityId,
				initiatorId
			}
		};

		const currentCredentialIndex = await VerifiableCredentialsDb.getNextCredentialIndex(this.serverIdentityId);
		const keyCollectionIndex = this.getKeyCollectionIndex(currentCredentialIndex);
		const keyCollection = await this.getKeyCollection(keyCollectionIndex);
		const nextCredentialIndex = await VerifiableCredentialsDb.getNextCredentialIndex(this.serverIdentityId);
		const keyIndex = nextCredentialIndex % KEY_COLLECTION_SIZE;
		const keyCollectionJson: KeyCollectionJson = {
			type: keyCollection.type,
			keys: keyCollection.keys,
			publicKeyBase58: keyCollection.publicKeyBase58
		};

		const issuerIdentity: IdentityJsonUpdate = await IdentityDocsDb.getIdentity(issuerId, this.serverSecret);
		if (!issuerIdentity) {
			throw new Error(this.noIssuerFoundErrMessage(issuerId));
		}
		const vc = await this.ssiService.createVerifiableCredential<CredentialSubject>(
			issuerIdentity,
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
			this.serverIdentityId
		);

		await this.setUserVerified(credential.id, issuerIdentity.doc.id, vc);
		return vc;
	}

	async checkVerifiableCredential(vc: VerifiableCredentialJson): Promise<boolean> {
		const serverIdentity: IdentityJson = await IdentityDocsDb.getIdentity(this.serverIdentityId, this.serverSecret);
		if (!serverIdentity) {
			throw new Error('no valid server identity to check the credential.');
		}
		const isVerifiedCredential = await this.ssiService.checkVerifiableCredential(vc);
		const trustedRoots = await this.getTrustedRootIds();

		const isTrustedIssuer = trustedRoots && trustedRoots.some((rootId) => rootId === vc.issuer);
		const isVerified = isVerifiedCredential && isTrustedIssuer;
		return isVerified;
	}

	async revokeVerifiableCredential(vcp: VerifiableCredentialPersistence, issuerId: string) {
		const subjectId = vcp.vc.id;

		const issuerIdentity: IdentityJsonUpdate = await IdentityDocsDb.getIdentity(issuerId, this.serverSecret);
		if (!issuerIdentity) {
			throw new Error(this.noIssuerFoundErrMessage(issuerId));
		}
		const keyCollectionIndex = this.getKeyCollectionIndex(vcp.index);
		const keyIndex = vcp.index % KEY_COLLECTION_SIZE;

		const res = await this.ssiService.revokeVerifiableCredential(issuerIdentity, keyCollectionIndex, keyIndex);
		await this.updateDatabaseIdentityDoc(res.docUpdate);

		if (res.revoked !== true) {
			this.logger.error(`could not revoke identity for ${subjectId} on the ledger, maybe it is already revoked!`);
			return;
		}

		await VerifiableCredentialsDb.revokeVerifiableCredential(vcp, this.serverIdentityId);
		await this.userService.removeUserVC(vcp.vc);

		return res;
	}

	private async updateDatabaseIdentityDoc(docUpdate: DocumentJsonUpdate) {
		await IdentityDocsDb.updateIdentityDoc(docUpdate);
	}

	async getLatestDocument(did: string) {
		return await this.ssiService.getLatestIdentityJson(did);
	}

	async getTrustedRootIds() {
		const trustedRoots = await TrustedRootsDb.getTrustedRootIds();

		if (!trustedRoots || trustedRoots.length === 0) {
			throw new Error('no trusted roots found!');
		}

		return trustedRoots.map((root) => root.identityId);
	}

	async addTrustedRootId(trustedRoot: string) {
		return TrustedRootsDb.addTrustedRootId(trustedRoot);
	}

	async removeTrustedRootId(trustedRoot: string) {
		return TrustedRootsDb.removeTrustedRootId(trustedRoot);
	}

	async setUserVerified(identityId: string, issuerId: string, vc: VerifiableCredentialJson) {
		if (!issuerId) {
			throw new Error('No valid issuer id!');
		}
		await this.userService.addUserVC(vc);
	}

	getKeyCollectionIndex = (currentCredentialIndex: number) => Math.floor(currentCredentialIndex / KEY_COLLECTION_SIZE);

	private async generateKeyCollection(keyCollectionIndex: number, keyCollectionSize: number, issuerId: string): Promise<KeyCollectionPersistence> {
		try {
			const issuerIdentity: IdentityJsonUpdate = await IdentityDocsDb.getIdentity(issuerId, this.serverSecret);

			if (!issuerIdentity) {
				throw new Error(this.noIssuerFoundErrMessage(issuerId));
			}

			const { keyCollectionJson, docUpdate } = await this.ssiService.generateKeyCollection(keyCollectionIndex, keyCollectionSize, issuerIdentity);
			await this.updateDatabaseIdentityDoc(docUpdate);
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
