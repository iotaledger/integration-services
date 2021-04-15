import { KEY_COLLECTION_INDEX, KEY_COLLECTION_SIZE } from '../config/identity';
import { KeyCollectionJson, KeyCollectionPersistence, VerifiableCredentialPersistence } from '../models/types/key-collection';
import {
	CreateIdentityBody,
	CredentialSubject,
	DocumentJsonUpdate,
	IdentityJson,
	IdentityJsonUpdate,
	VerifiableCredentialJson,
	Credential
} from '../models/types/identity';
import { User, VerificationUpdatePersistence } from '../models/types/user';
import { IdentityService } from './identity-service';
import { UserService } from './user-service';
import { createChallenge, getHexEncodedKey, verifiyChallenge } from '../utils/encryption';
import * as KeyCollectionDb from '../database/key-collection';
import * as VerifiableCredentialsDb from '../database/verifiable-credentials';
import * as AuthDb from '../database/auth';
import * as IdentitiesDb from '../database/identities';
import * as TrustedRootsDb from '../database/trusted-roots';
import jwt from 'jsonwebtoken';
import { AuthenticationServiceConfig } from '../models/config/services';

export class AuthenticationService {
	private noIssuerFoundErrMessage = (issuerId: string) => `No identiity found for issuerId: ${issuerId}`;
	private readonly identityService: IdentityService;
	private readonly userService: UserService;
	private readonly serverSecret: string;
	private readonly serverIdentityId: string;
	private readonly jwtExpiration: string;

	constructor(identityService: IdentityService, userService: UserService, authenticationServiceConfig: AuthenticationServiceConfig) {
		const { serverSecret, jwtExpiration, serverIdentityId } = authenticationServiceConfig;
		this.identityService = identityService;
		this.userService = userService;
		this.serverSecret = serverSecret;
		this.serverIdentityId = serverIdentityId;
		this.jwtExpiration = jwtExpiration;
	}

	saveKeyCollection(keyCollection: KeyCollectionPersistence) {
		return KeyCollectionDb.saveKeyCollection(keyCollection, this.serverIdentityId);
	}

	getKeyCollection(index: number) {
		return KeyCollectionDb.getKeyCollection(index, this.serverIdentityId);
	}

	generateKeyCollection = async (issuerId: string): Promise<KeyCollectionPersistence> => {
		const index = KEY_COLLECTION_INDEX;
		const count = KEY_COLLECTION_SIZE;
		const issuerIdentity: IdentityJsonUpdate = await IdentitiesDb.getIdentity(issuerId);
		if (!issuerIdentity) {
			throw new Error(this.noIssuerFoundErrMessage(issuerId));
		}
		const { keyCollectionJson, docUpdate } = await this.identityService.generateKeyCollection(issuerIdentity, count);
		await this.updateDatabaseIdentityDoc(docUpdate);
		return {
			...keyCollectionJson,
			count,
			index
		};
	};

	async getIdentityFromDb(did: string): Promise<IdentityJsonUpdate> {
		return IdentitiesDb.getIdentity(did);
	}

	createIdentity = async (createIdentityBody: CreateIdentityBody): Promise<IdentityJsonUpdate> => {
		const identity = await this.identityService.createIdentity();
		const user: User = {
			...createIdentityBody,
			userId: identity.doc.id.toString(),
			publicKey: identity.key.public
		};

		await this.userService.addUser(user);

		if (createIdentityBody.storeIdentity && this.serverSecret) {
			await IdentitiesDb.saveIdentity(identity, this.serverSecret);
		}

		return {
			...identity
		};
	};

	verifyUser = async (subject: User, issuerId: string, initiatorId: string) => {
		const credential: Credential<CredentialSubject> = {
			type: 'UserCredential',
			id: subject.userId,
			subject: {
				id: subject.userId,
				classification: subject.classification,
				organization: subject.organization,
				registrationDate: subject.registrationDate,
				username: subject.username,
				initiatorId
			}
		};

		// TODO#54 dynamic key collection index by querying identities size and max size of key collection
		// if reached create new keycollection, always get highest index
		const keyCollection = await this.getKeyCollection(KEY_COLLECTION_INDEX);
		const index = await VerifiableCredentialsDb.getNextCredentialIndex(KEY_COLLECTION_INDEX, this.serverIdentityId);
		const keyCollectionJson: KeyCollectionJson = {
			type: keyCollection.type,
			keys: keyCollection.keys
		};

		const issuerIdentity: IdentityJsonUpdate = await IdentitiesDb.getIdentity(issuerId);
		if (!issuerIdentity) {
			throw new Error(this.noIssuerFoundErrMessage(issuerId));
		}
		const vc = await this.identityService.createVerifiableCredential<CredentialSubject>(issuerIdentity, credential, keyCollectionJson, index);

		await VerifiableCredentialsDb.addVerifiableCredential(
			{
				vc,
				index,
				initiatorId,
				isRevoked: false,
				keyCollectionIndex: KEY_COLLECTION_INDEX
			},
			this.serverIdentityId
		);

		await this.setUserVerified(credential.id, issuerIdentity.doc.id, vc);
		return vc;
	};

	checkVerifiableCredential = async (vc: VerifiableCredentialJson): Promise<boolean> => {
		const serverIdentity: IdentityJson = await IdentitiesDb.getIdentity(this.serverIdentityId);
		if (!serverIdentity) {
			throw new Error('no valid server identity to check the credential.');
		}
		const isVerifiedCredential = await this.identityService.checkVerifiableCredential(vc);
		const trustedRoots = await this.getTrustedRootIds();

		const isTrustedIssuer = trustedRoots && trustedRoots.some((rootId) => rootId === vc.issuer);
		const isVerified = isVerifiedCredential && isTrustedIssuer;
		return isVerified;
	};

	revokeVerifiableCredential = async (vcp: VerifiableCredentialPersistence, issuerId: string) => {
		const subjectId = vcp.vc.id;

		const issuerIdentity: IdentityJsonUpdate = await IdentitiesDb.getIdentity(issuerId);
		if (!issuerIdentity) {
			throw new Error(this.noIssuerFoundErrMessage(issuerId));
		}

		const res = await this.identityService.revokeVerifiableCredential(issuerIdentity, vcp.index);
		await this.updateDatabaseIdentityDoc(res.docUpdate);

		if (res.revoked === true) {
			console.log('successfully revoked!');
		} else {
			console.log(`could not revoke identity for ${subjectId} on the ledger, maybe it is already revoked!`);
			return;
		}

		await VerifiableCredentialsDb.revokeVerifiableCredential(vcp, this.serverIdentityId);

		const updatedUser = await this.userService.removeUserVC(vcp.vc);
		const hasVerifiedVCs = await this.hasVerifiedVerifiableCredential(updatedUser.verifiableCredentials);

		if (updatedUser.verifiableCredentials.length === 0 || !hasVerifiedVCs) {
			const vup: VerificationUpdatePersistence = {
				userId: subjectId,
				verified: false,
				lastTimeChecked: new Date(),
				verificationDate: undefined,
				verificationIssuerId: undefined
			};
			await this.userService.updateUserVerification(vup);
		}

		return res;
	};

	hasVerifiedVerifiableCredential = async (vcs: VerifiableCredentialJson[]): Promise<boolean> => {
		if (!vcs || vcs.length === 0) {
			return false;
		}
		const vcVerifiedArr = await Promise.all(
			vcs.map(async (vc) => {
				return this.checkVerifiableCredential(vc);
			})
		);
		return vcVerifiedArr.some((v) => v);
	};

	private updateDatabaseIdentityDoc = async (docUpdate: DocumentJsonUpdate) => {
		await IdentitiesDb.updateIdentityDoc(docUpdate);
	};

	getLatestDocument = async (did: string) => {
		return await this.identityService.getLatestIdentityJson(did);
	};

	getTrustedRootIds = async () => {
		const trustedRoots = await TrustedRootsDb.getTrustedRootIds();

		if (!trustedRoots || trustedRoots.length === 0) {
			throw new Error('no trusted roots found!');
		}

		return trustedRoots.map((root) => root.userId);
	};

	getChallenge = async (userId: string) => {
		const user = await this.userService.getUser(userId);
		if (!user) {
			throw new Error(`no user with id: ${userId} found!`);
		}

		const challenge = createChallenge();
		await AuthDb.upsertChallenge({ userId: user.userId, challenge });
		return challenge;
	};

	authenticate = async (signedChallenge: string, userId: string) => {
		const user = await this.userService.getUser(userId);
		if (!user) {
			throw new Error(`no user with id: ${userId} found!`);
		}
		const { challenge } = await AuthDb.getChallenge(userId);
		const publicKey = getHexEncodedKey(user.publicKey);

		const verified = await verifiyChallenge(publicKey, challenge, signedChallenge);
		if (!verified) {
			throw new Error('signed challenge is not valid!');
		}

		if (!this.serverSecret) {
			throw new Error('no server secret set!');
		}

		const signedJwt = jwt.sign({ user }, this.serverSecret, { expiresIn: this.jwtExpiration });
		return signedJwt;
	};

	setUserVerified = async (userId: string, issuerId: string, vc: VerifiableCredentialJson) => {
		if (!issuerId) {
			throw new Error('No valid issuer id!');
		}
		const date = new Date();
		const vup: VerificationUpdatePersistence = {
			userId,
			verified: true,
			lastTimeChecked: date,
			verificationDate: date,
			verificationIssuerId: issuerId
		};
		await this.userService.updateUserVerification(vup);
		await this.userService.addUserVC(vc);
	};
}
