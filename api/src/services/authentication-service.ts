import { getKeyCollection, saveKeyCollection } from '../database/key-collection';
import {
  addKeyCollectionIdentity,
  getKeyCollectionIdentity,
  getLinkedIdentitesSize,
  revokeKeyCollectionIdentity
} from '../database/key-collection-links';
import { IdentityResponse, KeyCollectionJson, KeyCollectionPersistence, UserCredential } from '../models/data/identity';
import { User, UserClassification, UserWithoutId } from '../models/data/user';
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
    try {
      return this.identityService.generateKeyCollection(0, 8);
    } catch (error) {
      console.log('ERRRORRRRR', error);
    }
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

  createVerifiableCredential = async () => {
    const username = 'first-user';
    const organization = 'IOTA';
    const registrationDate = '2021-02-12T14:58:05+01:00';
    const classification = UserClassification.human;
    const id = 'did:iota:27TxfmHDD5aQYAcHmNohc21yMdcmDSE77ZT3mHj9Hms3';
    const userCredential: Credential<UserCredential> = {
      type: 'UserCredential',
      id,
      subject: {
        id,
        username,
        organization,
        registrationDate,
        classification
      }
    };
    const keyCollection = await getKeyCollection(0);
    const index = await getLinkedIdentitesSize();
    console.log('INDEX ', index);

    const keyCollectionJson: KeyCollectionJson = {
      type: keyCollection.type,
      keys: keyCollection.keys
    };
    const cv = await this.identityService.createVerifiableCredential<UserCredential>(userCredential, keyCollectionJson, index);
    const size = await getLinkedIdentitesSize();
    addKeyCollectionIdentity({
      index: size,
      isRevoked: false,
      linkedIdentity: id,
      keyCollectionIndex: 0 // TODO dynamic keycollection index
    });
    // TODO update user to be verified!
    return cv;
  };

  checkVerifiableCredential = async (vc: any) => {
    const res = await this.identityService.checkVerifiableCredential(vc);
    // TODO update user to be verified!
    return res;
  };

  revokeVerifiableCredential = async (vc: any) => {
    const kci = await getKeyCollectionIdentity(vc?.id);
    if (!kci) {
      throw new Error('No identity found to revoke the verification!');
    }

    const res = await this.identityService.revokeVerifiableCredential(vc);
    if (res === true) {
      revokeKeyCollectionIdentity(kci);
    } else {
      console.log('Could not revoke identity for ', vc?.id);
    }
    // TODO update user to be no more verified!
    return res;
  };
}
