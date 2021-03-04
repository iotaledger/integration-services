import { KEY_COLLECTION_INDEX } from '../config/identity';
import { getKeyCollection, saveKeyCollection } from '../database/key-collection';
import {
  addKeyCollectionIdentity,
  getKeyCollectionIdentity,
  getLinkedIdentitesSize,
  revokeKeyCollectionIdentity
} from '../database/key-collection-links';
import { IdentityResponse, KeyCollectionJson, KeyCollectionPersistence, UserCredential } from '../models/data/identity';
import { User, UserWithoutId } from '../models/data/user';
import { Credential, IdentityService } from './identity-service';
import { UserService } from './user-service';

export class AuthenticationService {
  identityService: IdentityService;
  userService: UserService;
  constructor(identityService: IdentityService, userService: UserService) {
    this.identityService = identityService;
    this.userService = userService;
  }

  saveKeyCollection(keyCollection: KeyCollectionPersistence) {
    return saveKeyCollection(keyCollection);
  }

  generateKeyCollection = async (): Promise<KeyCollectionPersistence> => {
    return this.identityService.generateKeyCollection(0, 8);
  };

  createIdentity = async (userWithoutId: UserWithoutId): Promise<IdentityResponse> => {
    const identity = await this.identityService.createIdentity();
    const user: User = {
      ...userWithoutId,
      userId: identity.doc.id.toString(),
      publicKey: identity.key.public
    };

    const result = await this.userService.addUser(user);

    if (!result?.result?.n) {
      throw new Error('Could not create user identity!');
    }
    return {
      ...identity
    };
  };

  createVerifiableCredential = async (userCredential: UserCredential) => {
    const credential: Credential<UserCredential> = {
      type: 'UserCredential',
      id: userCredential.id,
      subject: {
        ...userCredential
      }
    };
    const keyCollection = await getKeyCollection(KEY_COLLECTION_INDEX);
    const index = await getLinkedIdentitesSize(KEY_COLLECTION_INDEX);
    const keyCollectionJson: KeyCollectionJson = {
      type: keyCollection.type,
      keys: keyCollection.keys
    };
    const cv = await this.identityService.createVerifiableCredential<UserCredential>(credential, keyCollectionJson, index);
    const res = await addKeyCollectionIdentity({
      index,
      isRevoked: false,
      linkedIdentity: userCredential.id,
      keyCollectionIndex: KEY_COLLECTION_INDEX
    });
    if (!res?.result.n) {
      throw new Error('Could not verify identity!');
    }
    // TODO update user to be verified!
    return cv;
  };

  checkVerifiableCredential = async (vc: any) => {
    const res = await this.identityService.checkVerifiableCredential(vc);
    // TODO update user to be verified!
    return res;
  };

  revokeVerifiableCredential = async (did: string) => {
    const kci = await getKeyCollectionIdentity(did);
    if (!kci) {
      throw new Error('No identity found to revoke the verification!');
    }

    const res = await this.identityService.revokeVerifiableCredential(kci.index);
    if (res === true) {
      revokeKeyCollectionIdentity(kci);
    } else {
      console.log('Could not revoke identity for ', did);
    }
    // TODO update user to be no more verified!
    return res;
  };
}
