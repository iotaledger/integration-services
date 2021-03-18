import { KEY_COLLECTION_INDEX, KEY_COLLECTION_SIZE } from '../config/identity';
import { getIdentity, saveIdentity, updateIdentityDoc } from '../database/identities';
import { getKeyCollection, saveKeyCollection } from '../database/key-collection';
import {
  addKeyCollectionIdentity,
  getLinkedKeyCollectionIdentity,
  getLinkedIdentitesSize,
  revokeKeyCollectionIdentity
} from '../database/key-collection-links';
import { KeyCollectionJson, KeyCollectionPersistence } from '../models/data/key-collection';
import { CreateIdentityBody, DocumentJsonUpdate, IdentityJson, IdentityJsonUpdate, UserCredential } from '../models/data/identity';
import { User, VerificationUpdatePersistence } from '../models/data/user';
import { getDateFromString } from '../utils/date';
import { Credential, IdentityService } from './identity-service';
import { UserService } from './user-service';
import { createChallenge, getHexEncodedKey, verifiyChallenge } from '../utils/encryption';
import { upsertChallenge, getChallenge } from '../database/auth';
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
    return saveKeyCollection(keyCollection);
  }

  getKeyCollection(index: number) {
    return getKeyCollection(index);
  }

  generateKeyCollection = async (issuerId: string): Promise<KeyCollectionPersistence> => {
    const index = KEY_COLLECTION_INDEX;
    const count = KEY_COLLECTION_SIZE;
    const issuerIdentity: IdentityJsonUpdate = await getIdentity(issuerId);
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
      await saveIdentity(identity);
    }

    return {
      ...identity
    };
  };

  createVerifiableCredential = async (userCredential: UserCredential, issuerId: string) => {
    const user = await this.userService.getUser(userCredential.id);
    if (!user) {
      throw new Error("User does not exist, so he can't be verified!");
    }

    const credential: Credential<UserCredential> = {
      type: 'UserCredential',
      id: userCredential.id,
      subject: {
        ...userCredential
      }
    };

    const keyCollection = await this.getKeyCollection(KEY_COLLECTION_INDEX);
    const index = await getLinkedIdentitesSize(KEY_COLLECTION_INDEX);
    const keyCollectionJson: KeyCollectionJson = {
      type: keyCollection.type,
      keys: keyCollection.keys
    };

    const issuerIdentity: IdentityJsonUpdate = await getIdentity(issuerId);
    if (!issuerIdentity) {
      throw new Error(this.noIssuerFoundErrMessage(issuerId));
    }
    const vc = await this.identityService.createVerifiableCredential<UserCredential>(issuerIdentity, credential, keyCollectionJson, index);

    await addKeyCollectionIdentity({
      index,
      isRevoked: false,
      linkedIdentity: userCredential.id,
      keyCollectionIndex: KEY_COLLECTION_INDEX
    });

    await this.setUserVerified(credential.id, issuerIdentity.doc.id);
    return vc;
  };

  checkVerifiableCredential = async (vc: any, issuerId: string) => {
    const issuerIdentity: IdentityJson = await getIdentity(issuerId);
    if (!issuerIdentity) {
      throw new Error(this.noIssuerFoundErrMessage(issuerId));
    }
    const isVerified = await this.identityService.checkVerifiableCredential(issuerIdentity, vc);
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
    const kci = await getLinkedKeyCollectionIdentity(did);
    if (!kci) {
      throw new Error('no identity found to revoke the verification! maybe the identity is already revoked.');
    }
    const issuerIdentity: IdentityJsonUpdate = await getIdentity(issuerId);

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

    await revokeKeyCollectionIdentity(kci);

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
    await updateIdentityDoc(docUpdate);
  };

  getLatestDocument = async (did: string) => {
    return await this.identityService.getLatestIdentity(did);
  };

  getChallenge = async (userId: string) => {
    const user = await this.userService.getUser(userId);
    if (!user) {
      throw new Error(`no user with id: ${userId} found!`);
    }

    const challenge = createChallenge();
    await upsertChallenge({ userId: user.userId, challenge });
    return challenge;
  };

  authenticate = async (signedChallenge: string, userId: string) => {
    const user = await this.userService.getUser(userId);
    if (!user) {
      throw new Error(`no user with id: ${userId} found!`);
    }
    const { challenge } = await getChallenge(userId);
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
