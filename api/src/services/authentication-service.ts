import { KEY_COLLECTION_INDEX, KEY_COLLECTION_SIZE } from '../config/identity';
import { KeyCollectionJson, KeyCollectionPersistence } from '../models/data/key-collection';
import {
	CreateIdentityBody,
	CredentialSubject,
	DocumentJsonUpdate,
	IdentityJson,
	IdentityJsonUpdate,
	VerifiableCredentialJson
} from '../models/data/identity';
import { User, VerificationUpdatePersistence } from '../models/data/user';
import { getDateFromString } from '../utils/date';
import { Credential, IdentityService } from './identity-service';
import { UserService } from './user-service';
import { createChallenge, getHexEncodedKey, verifiyChallenge } from '../utils/encryption';
import * as KeyCollectionDb from '../database/key-collection';
import * as KeyCollectionLinksDb from '../database/key-collection-links';
import * as AuthDb from '../database/auth';
import * as IdentitiesDb from '../database/identities';
import * as TrustedRootsDb from '../database/trusted-roots';
import jwt from 'jsonwebtoken';

export class AuthenticationService {
	private noIssuerFoundErrMessage = (issuerId: string) => `No identiity found for issuerId: ${issuerId}`;
	private readonly identityService: IdentityService;
	private readonly userService: UserService;
	private readonly serverSecret: string;
	constructor(identityService: IdentityService, userService: UserService, serverSecret: string) {
		this.identityService = identityService;
		this.userService = userService;
		this.serverSecret = serverSecret;
	}

	saveKeyCollection(keyCollection: KeyCollectionPersistence) {
		return KeyCollectionDb.saveKeyCollection(keyCollection);
	}

	getKeyCollection(index: number) {
		return KeyCollectionDb.getKeyCollection(index);
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

	createIdentity = async (createIdentityBody: CreateIdentityBody): Promise<IdentityJsonUpdate> => {
		const identity = await this.identityService.createIdentity();
		const user: User = {
			...createIdentityBody,
			userId: identity.doc.id.toString(),
			publicKey: identity.key.public
		};

		await this.userService.addUser(user);

		if (createIdentityBody.storeIdentity) {
			await IdentitiesDb.saveIdentity(identity);
		}

		return {
			...identity
		};
	};

	verifyUser = async (subjectId: string, issuerId: string, initiatorOrganiziation?: string) => {
		const user = await this.userService.getUser(subjectId);
		if (!user) {
			throw new Error('user does not exist!');
		}
		if ((initiatorOrganiziation || user.organization) && user.organization !== initiatorOrganiziation) {
			throw new Error('user must be in same organization!');
		}

		const credential: Credential<CredentialSubject> = {
			type: 'UserCredential',
			id: subjectId,
			subject: {
				id: subjectId,
				classification: user.classification,
				organization: user.organization,
				registrationDate: user.registrationDate,
				username: user.username
			}
		};

		// TODO#54 dynamic key collection index by querying identities size and max size of key collection
		// if reached create new keycollection, always get highest index
		const keyCollection = await this.getKeyCollection(KEY_COLLECTION_INDEX);
		const index = await KeyCollectionLinksDb.getLinkedIdentitesSize(KEY_COLLECTION_INDEX);
		const keyCollectionJson: KeyCollectionJson = {
			type: keyCollection.type,
			keys: keyCollection.keys
		};

		const issuerIdentity: IdentityJsonUpdate = await IdentitiesDb.getIdentity(issuerId);
		if (!issuerIdentity) {
			throw new Error(this.noIssuerFoundErrMessage(issuerId));
		}
		const vc = await this.identityService.createVerifiableCredential<CredentialSubject>(issuerIdentity, credential, keyCollectionJson, index);

		await KeyCollectionLinksDb.addKeyCollectionIdentity({
			index,
			isRevoked: false,
			linkedIdentity: subjectId,
			keyCollectionIndex: KEY_COLLECTION_INDEX
		});

		await this.setUserVerified(credential.id, issuerIdentity.doc.id);
		return vc;
	};

	checkVerifiableCredential = async (vc: VerifiableCredentialJson, issuerId: string) => {
		const issuerIdentity: IdentityJson = await IdentitiesDb.getIdentity(issuerId);
		if (!issuerIdentity) {
			throw new Error(this.noIssuerFoundErrMessage(issuerId));
		}
		const isVerifiedCredential = await this.identityService.checkVerifiableCredential(issuerIdentity, vc);
		const trustedRoots = await this.getTrustedRootIdentities();

		const isTrustedIssuer = trustedRoots && trustedRoots.some((identity) => identity.userId === vc.issuer);
		const isVerified = isVerifiedCredential && isTrustedIssuer;
		try {
			const user = await this.userService.getUser(vc.id);
			const vup: VerificationUpdatePersistence = {
				userId: user.userId,
				verified: isVerified,
				lastTimeChecked: new Date(),
				verificationDate: getDateFromString(user?.verification?.verificationDate),
				verificationIssuerId: user?.verification?.verificationIssuerId
			};

			await this.userService.updateUserVerification(vup);
		} catch (err) {
			console.error(err);
		}
		return { isVerified };
	};

	revokeVerifiableCredential = async (did: string, issuerId: string) => {
		const kci = await KeyCollectionLinksDb.getLinkedKeyCollectionIdentity(did);
		if (!kci) {
			throw new Error('no identity found to revoke the verification! maybe the identity is already revoked.');
		}
		const issuerIdentity: IdentityJsonUpdate = await IdentitiesDb.getIdentity(issuerId);

		if (!issuerIdentity) {
			throw new Error(this.noIssuerFoundErrMessage(issuerId));
		}

		const res = await this.identityService.revokeVerifiableCredential(issuerIdentity, kci.index);
		await this.updateDatabaseIdentityDoc(res.docUpdate);

		if (res.revoked === true) {
			console.log('successfully revoked!');
		} else {
			console.log(`could not revoke identity for ${did} on the ledger, maybe it is already revoked!`);
			return;
		}

		await KeyCollectionLinksDb.revokeKeyCollectionIdentity(kci);

		const vup: VerificationUpdatePersistence = {
			userId: did,
			verified: false,
			lastTimeChecked: new Date(),
			verificationDate: undefined,
			verificationIssuerId: undefined
		};
		await this.userService.updateUserVerification(vup);

		return res;
	};

	private updateDatabaseIdentityDoc = async (docUpdate: DocumentJsonUpdate) => {
		await IdentitiesDb.updateIdentityDoc(docUpdate);
	};

	getLatestDocument = async (did: string) => {
		return await this.identityService.getLatestIdentity(did);
	};

	getTrustedRootIdentities = async () => {
		const trustedRoots = await TrustedRootsDb.getTrustedRootIds();

		if (!trustedRoots || trustedRoots.length === 0) {
			throw new Error('no trusted roots found!');
		}

		const trustedRootIds = trustedRoots.map((root) => root.userId);
		return await this.userService.getUsersByIds(trustedRootIds);
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

		const signedJwt = jwt.sign({ user }, this.serverSecret, { expiresIn: '2 days' });
		return signedJwt;
	};

	private setUserVerified = async (userId: string, issuerId: string) => {
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
	};
}
