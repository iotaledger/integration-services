import { IdentityConfig } from '../../models/config';
import { IdentityService } from '../../services/identity-service';
import { AuthenticationRoutes } from './index';
import { AuthenticationService } from '../../services/authentication-service';
import { UserService } from '../../services/user-service';
import { StatusCodes } from 'http-status-codes';
import * as KeyCollectionDB from '../../database/key-collection';
import * as KeyCollectionLinksDB from '../../database/key-collection-links';
import * as IdentitiesDb from '../../database/identities';
import { KEY_COLLECTION_INDEX } from '../../config/identity';
import { LinkedKeyCollectionIdentityPersistence } from '../../models/data/key-collection';

const identityDocumentMock = {
  doc: {
    id: 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN',
    authentication: [
      {
        id: 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN#key',
        controller: 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN',
        type: 'Ed25519VerificationKey2018',
        publicKeyBase58: 'AavQx5RH1c1zcHbUtwMEq9UVzdPKfPV1bXKxTsvW6b7D'
      }
    ],
    created: '2021-02-25T17:51:54Z',
    updated: '2021-02-25T17:51:54Z',
    immutable: false,
    proof: {
      type: 'JcsEd25519Signature2020',
      verificationMethod: '#key',
      signatureValue: '4REKUzJ5bw6FtF4FdY6xLaoHR5NnovEA2Hi6T3aMs459mkpMvHmwEUSvDQk8FzqwB28bu51VCfF1ZzswcQsSaFkP'
    }
  },
  key: {
    type: 'ed25519',
    public: 'AavQx5RH1c1zcHbUtwMEq9UVzdPKfPV1bXKxTsvW6b7D',
    secret: 'secret-key'
  },
  explorerUrl: 'https://explorer.iota.org/mainnet/transaction/GOLMVJ9MRHOPVMXAYUDJZISYDVBMUGMHFLDXEFAMWRECFU9BFQFGMBPVMYRTFRUAHQCAC99O9LQPA9999',
  txHash: 'GOLMVJ9MRHOPVMXAYUDJZISYDVBMUGMHFLDXEFAMWRECFU9BFQFGMBPVMYRTFRUAHQCAC99O9LQPA9999'
};

const vcMock = {
  '@context': 'https://www.w3.org/2018/credentials/v1',
  id: 'did:iota:BfaKRQcBB5G6Kdg7w7HESaVhJfJcQFgg3VSijaWULDwk',
  type: ['VerifiableCredential', 'UserCredential'],
  credentialSubject: {
    id: 'did:iota:BfaKRQcBB5G6Kdg7w7HESaVhJfJcQFgg3VSijaWULDwk',
    classification: 'device',
    organization: 'IOTA',
    registrationDate: '2021-03-02T15:05:26.613Z',
    username: 'test-device'
  },
  issuer: 'did:iota:9SYbnYQbBj8b7ykE4yqsFtuNFUrUoWU2zSxLeMDq8Nkt',
  issuanceDate: '2021-03-11T09:56:36Z',
  proof: {
    type: 'MerkleKeySignature2021',
    verificationMethod: '#key-collection',
    signatureValue:
      '9wZMHHmycPb47UtHkrWJaMPDpjEE8f7QnF6rxB8Th8pC.1119spw7ADgrjmAytGqBLDT8hbJ3tkcxTohTuDt5SyPHkR2WcqrqYJVHyw18QWnmfkor2x9ZXPiV7cYn2P3Twh4nd1t6DkEckrFJ1vZ7DM8iHvmMXUw6qGhgrW3uBQT6dMHf6qzxGrQ.427g9KcphAdJYnnDCaVs7GbLdrTzh2PEHDhAEdweP1CeAHDwJSwkv7SAUECtDvkqLxkE6AEPdkxksWk9c6sE5Zcn'
  }
};

const keyCollectionMock = {
  _id: 0,
  count: 8,
  index: 0,
  type: 'ed25519',
  keys: [
    { public: '8umCw8eGrcJvo2uEcfa4138LJaW3mebiQkDfEaR7hTpG', secret: 'fmgfdXAGDpc9AGnNVHUiktAi8KQnhi2cWeL5Lp1TWtm' },
    { public: 'AKUEjuUumzF8h2qArNzPVko51z4XmSL6xNcDGFqzpiT7', secret: 'EHUYgZTk83xyeBNzYRVBb1StF6mDnzLjEwdX8PpCAtZ5' },
    { public: '9doihy1Vi8Wombo4bXpzPfzH8dLd6rPxReXVVJgZZTLB', secret: '4rtQE2ntEFMMJuq8dThh7FBEZjhJrh3RdGVWvURfFv7J' },
    { public: '4sTkdxkk8yPD8KuV8zEVWVdxYoup9JUQ8DgZE3yAGYF8', secret: '8Qc9akDgq6bQH7ZVCnGTcYwFTqCuzqzQ8X9oss1A85MN' },
    { public: 'B6vuVrVtoBtEdGMT4oYKeWkZrpoT1Yu5DD9qaT7rbsV2', secret: '3MDDAgayhRsuBPjDtdGy9nUKqrC8XZghWTamFrRLSZ4s' },
    { public: '9wZMHHmycPb47UtHkrWJaMPDpjEE8f7QnF6rxB8Th8pC', secret: '5ZVUCJXn4NKXp7xwo82Cb9TfasGTrdUJZzd7kgbaaej6' },
    { public: '3hdnmH8vgc48nsRZt5HVtMrygHF6Ny3HDxPQQPvics9H', secret: 'FJ3eT8cixEkaunp69m1EtwraTvKQBZiRTXaUdQ4eKJkB' },
    { public: 'Gvg1u3msZzxtPztpLYPi9LKxMrj6kymyEvfsYyWw3q3U', secret: 'FZJrYHUohUDmLtKLFLoP9LS1qpuNAvDctm6AwNAvZrRC' }
  ]
};
const issuerIdentityId = 'did:iota:9SYbnYQbBj8b7ykE4yqsFtuNFUrUoWU2zSxLeMDq8Nkt';

const issuerIdentityMock = {
  _id: 'did:iota:9SYbnYQbBj8b7ykE4yqsFtuNFUrUoWU2zSxLeMDq8Nkt',
  doc: {
    id: 'did:iota:9SYbnYQbBj8b7ykE4yqsFtuNFUrUoWU2zSxLeMDq8Nkt',
    verificationMethod: [
      {
        id: 'did:iota:9SYbnYQbBj8b7ykE4yqsFtuNFUrUoWU2zSxLeMDq8Nkt#key-collection',
        controller: 'did:iota:9SYbnYQbBj8b7ykE4yqsFtuNFUrUoWU2zSxLeMDq8Nkt',
        type: 'MerkleKeyCollection2021',
        publicKeyBase58: '112EEFg1iVo3xsgboycoUkxbU25N9zEvJJbqhudazuq3gy',
        revocation: 'OjAAAAEAAAAAAAEAEAAAAAIAAwA='
      }
    ],
    authentication: [
      {
        id: 'did:iota:9SYbnYQbBj8b7ykE4yqsFtuNFUrUoWU2zSxLeMDq8Nkt#key',
        controller: 'did:iota:9SYbnYQbBj8b7ykE4yqsFtuNFUrUoWU2zSxLeMDq8Nkt',
        type: 'Ed25519VerificationKey2018',
        publicKeyBase58: '5mMxNmByrAwfuC17pgSDxVfb8uRKUSiVCLJpTXRyQBKr'
      }
    ],
    created: '2021-03-10T14:55:11Z',
    updated: '2021-03-10T14:55:11Z',
    immutable: false,
    previous_message_id: 'EDJNMT9BWHPTUMIUWBGJVNVVXWJPQOLDFINGHWI9PDUKMXLJKPMBEIEXPJDJH9SGFZFKJYTCAQVJA9999',
    proof: {
      type: 'JcsEd25519Signature2020',
      verificationMethod: '#key',
      signatureValue: '4kDpwXqbzeDHHNzqYUzU3sxbhk8g7d2BzwheHNq62tvW8esf994wXxKZE3iWRTtDpmc1DFCsTW1tLdtvz3euQo3W'
    }
  },
  key: { type: 'ed25519', public: '5mMxNmByrAwfuC17pgSDxVfb8uRKUSiVCLJpTXRyQBKr', secret: '3z9CUwVGVq8HP3CYqczVnQXKKb3Yb2s2bsAUbTNroSTz' },
  txHash: 'NWFOSJPZAYLXKRAPPMKKCZGFOPTBEANZNURTLVCTOVXMFZWOYXZOSDOOXM9MXLZPFQVKORHXKBHKZ9999'
};

describe('test authentication routes', () => {
  let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
  let userService: UserService;
  let identityService: IdentityService, authenticationService: AuthenticationService, authenticationRoutes: AuthenticationRoutes;
  beforeEach(() => {
    sendMock = jest.fn();
    sendStatusMock = jest.fn();
    nextMock = jest.fn();
    const config: any = {
      serverIdentityId: issuerIdentityId
    };
    const identityConfig: IdentityConfig = {
      keyCollectionTag: 'key-collection',
      explorer: '',
      network: 'test',
      node: '',
      keyType: 0,
      hashFunction: 0
    };
    identityService = IdentityService.getInstance(identityConfig);
    userService = new UserService();
    authenticationService = new AuthenticationService(identityService, userService, 'very-secret-secret');
    authenticationRoutes = new AuthenticationRoutes(authenticationService, config);

    res = {
      send: sendMock,
      sendStatus: sendStatusMock,
      status: jest.fn(() => res)
    };
  });

  describe('test create-identity route', () => {
    it('should send result for valid body', async () => {
      const identitySpy = spyOn(identityService, 'createIdentity').and.returnValue(identityDocumentMock);
      const saveIdentitySpy = spyOn(IdentitiesDb, 'saveIdentity').and.returnValue(identityDocumentMock);
      const userSpy = spyOn(userService, 'addUser').and.returnValue({ result: { n: 1 } });
      const req: any = {
        params: {},
        body: {
          username: 'test-username',
          classification: 'human',
          firstName: 'Mister',
          lastName: 'Subscriber',
          organization: 'IOTA',
          subscribedChannelIds: ['test-address-c2', 'test-address'],
          description: 'test'
        }
      };

      const exptectedUser = {
        classification: 'human',
        description: 'test',
        firstName: 'Mister',
        lastName: 'Subscriber',
        organization: 'IOTA',
        subscribedChannelIds: ['test-address-c2', 'test-address'],
        userId: 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN',
        publicKey: 'AavQx5RH1c1zcHbUtwMEq9UVzdPKfPV1bXKxTsvW6b7D',
        username: 'test-username'
      };
      await authenticationRoutes.createIdentity(req, res, nextMock);
      expect(identitySpy).toHaveBeenCalledWith();
      expect(userSpy).toHaveBeenCalledWith(exptectedUser);
      expect(saveIdentitySpy).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.send).toHaveBeenCalledWith(identityDocumentMock);
    });
    it('should save the identity since it is called to with storeIdentity=true', async () => {
      const identitySpy = spyOn(identityService, 'createIdentity').and.returnValue(identityDocumentMock);
      const saveIdentitySpy = spyOn(IdentitiesDb, 'saveIdentity');
      const userSpy = spyOn(userService, 'addUser').and.returnValue({ result: { n: 1 } });
      const req: any = {
        params: {},
        body: {
          username: 'test-username',
          classification: 'human',
          firstName: 'Mister',
          lastName: 'Subscriber',
          storeIdentity: true,
          organization: 'IOTA',
          subscribedChannelIds: ['test-address-c2', 'test-address'],
          description: 'test'
        }
      };

      const exptectedUser = {
        classification: 'human',
        description: 'test',
        firstName: 'Mister',
        lastName: 'Subscriber',
        storeIdentity: true,
        organization: 'IOTA',
        subscribedChannelIds: ['test-address-c2', 'test-address'],
        userId: 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN',
        publicKey: 'AavQx5RH1c1zcHbUtwMEq9UVzdPKfPV1bXKxTsvW6b7D',
        username: 'test-username'
      };
      await authenticationRoutes.createIdentity(req, res, nextMock);
      expect(identitySpy).toHaveBeenCalledWith();
      expect(userSpy).toHaveBeenCalledWith(exptectedUser);
      expect(saveIdentitySpy).toHaveBeenCalledWith(identityDocumentMock);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.send).toHaveBeenCalledWith(identityDocumentMock);
    });
  });

  describe('test createVerifiableCredential route', () => {
    let createVerifiableCredentialSpy: any, userMock: any, keyCollectionIndex: any, getKeyCollectionSpy: any;
    let getLinkedIdentitySpy: any, addKeyCollectionIdentitySpy: any, updateUserVerificationSpy: any, userCredential: any;
    beforeEach(() => {
      userCredential = {
        id: 'did:iota:BfaKRQcBB5G6Kdg7w7HESaVhJfJcQFgg3VSijaWULDwk',
        username: 'test-device',
        classification: 'device',
        organization: 'IOTA',
        registrationDate: '2021-03-02T15:05:26.613Z'
      };
      createVerifiableCredentialSpy = spyOn(identityService, 'createVerifiableCredential').and.returnValue(vcMock);
      userMock = {};
      keyCollectionIndex = 0;
      getKeyCollectionSpy = spyOn(KeyCollectionDB, 'getKeyCollection').and.returnValue(keyCollectionMock);
      getLinkedIdentitySpy = spyOn(KeyCollectionLinksDB, 'getLinkedIdentitesSize').and.returnValue(keyCollectionIndex);
      addKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'addKeyCollectionIdentity');
      updateUserVerificationSpy = spyOn(userService, 'updateUserVerification');
    });

    it('should create vc for valid body', async () => {
      const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
      const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(issuerIdentityMock);
      const req: any = {
        params: {},
        body: userCredential
      };

      const expectedCredential = {
        type: 'UserCredential',
        id: userCredential.id,
        subject: {
          ...userCredential
        }
      };
      const expectedKeyCollection = {
        type: keyCollectionMock.type,
        keys: keyCollectionMock.keys
      };
      const expectedAddKeyCollectionCall = {
        index: 0,
        isRevoked: false,
        keyCollectionIndex: 0,
        linkedIdentity: userCredential.id
      };
      await authenticationRoutes.createVerifiableCredential(req, res, nextMock);

      expect(getUserSpy).toHaveBeenCalledWith(userCredential.id);
      expect(getKeyCollectionSpy).toHaveBeenCalledWith(KEY_COLLECTION_INDEX);
      expect(getLinkedIdentitySpy).toHaveBeenCalledWith(KEY_COLLECTION_INDEX);
      expect(getIdentitySpy).toHaveBeenCalledWith(issuerIdentityId);
      expect(createVerifiableCredentialSpy).toHaveBeenCalledWith(issuerIdentityMock, expectedCredential, expectedKeyCollection, keyCollectionIndex);
      expect(addKeyCollectionIdentitySpy).toHaveBeenCalledWith(expectedAddKeyCollectionCall);
      expect(updateUserVerificationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          verified: true
        })
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.send).toHaveBeenCalledWith(vcMock);
    });

    it('should throw error if user does not exist!', async () => {
      // returns null since user does not exist!
      const getUserSpy = spyOn(userService, 'getUser').and.returnValue(null);

      const req: any = {
        params: {},
        body: userCredential
      };

      await authenticationRoutes.createVerifiableCredential(req, res, nextMock);

      expect(getUserSpy).toHaveBeenCalledWith(userCredential.id);
      expect(nextMock).toHaveBeenCalledWith(new Error("User does not exist, so he can't be verified!"));
    });

    it('should throw error if no issuerIdentity is found!', async () => {
      const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
      // returns null since issuer identity does not exist!
      const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(null);
      const req: any = {
        params: {},
        body: userCredential
      };

      await authenticationRoutes.createVerifiableCredential(req, res, nextMock);

      expect(getUserSpy).toHaveBeenCalledWith(userCredential.id);
      expect(getKeyCollectionSpy).toHaveBeenCalledWith(KEY_COLLECTION_INDEX);
      expect(getLinkedIdentitySpy).toHaveBeenCalledWith(KEY_COLLECTION_INDEX);
      expect(getIdentitySpy).toHaveBeenCalledWith(issuerIdentityId);
      expect(nextMock).toHaveBeenCalledWith(new Error(`No identiity found for issuerId: ${issuerIdentityId}`));
    });
  });

  describe('test checkVerifiableCredential route', () => {
    let userMock: any, updateUserVerificationSpy: any;
    beforeEach(() => {
      updateUserVerificationSpy = spyOn(userService, 'updateUserVerification');
      userMock = {
        userId: 'did:iota:BfaKRQcBB5G6Kdg7w7HESaVhJfJcQFgg3VSijaWULDwk',
        publicKey: 'TEST_PUBLIC_KEY',
        username: 'test-device3',
        classification: 'device',
        subscribedChannelIds: ['test-address-c2', 'test-address'],
        firstName: null,
        lastName: null,
        description: 'Device which measures temperature in the kitchen.',
        registrationDate: '2021-03-02T16:05:26+01:00',
        verification: {
          verified: false,
          lastTimeChecked: '2021-03-08T17:19:13+01:00'
        },
        organization: 'IOTA'
      };
    });

    it('should return error since it is no valid vc', async () => {
      const isVerified = true;
      const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
      const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(isVerified);
      const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(issuerIdentityMock);
      const req: any = {
        params: {},
        body: null // no valid vc!
      };

      await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

      expect(getIdentitySpy).not.toHaveBeenCalled();
      expect(checkVerifiableCredentialSpy).not.toHaveBeenCalled();
      expect(getUserSpy).not.toHaveBeenCalled();
      expect(updateUserVerificationSpy).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(new Error('No valid verifiable credential provided!'));
    });

    it('should throw an error since no issuer is found with the id!', async () => {
      const isVerified = true;
      const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
      const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(isVerified);
      // no issuer found
      const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(null);
      const req: any = {
        params: {},
        body: vcMock
      };

      await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

      expect(getIdentitySpy).toHaveBeenCalledWith(issuerIdentityId);
      expect(checkVerifiableCredentialSpy).not.toHaveBeenCalled();
      expect(getUserSpy).not.toHaveBeenCalled();
      expect(updateUserVerificationSpy).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(new Error(`No identiity found for issuerId: ${issuerIdentityId}`));
    });

    it('should return false since it is not verified', async () => {
      const isVerified = false;
      const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
      const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(isVerified);
      const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(issuerIdentityMock);
      const req: any = {
        params: {},
        body: vcMock
      };

      await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

      expect(getIdentitySpy).toHaveBeenCalledWith(issuerIdentityId);
      expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(issuerIdentityMock, vcMock);
      expect(getUserSpy).toHaveBeenCalledWith(userMock.userId);
      expect(updateUserVerificationSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith({ isVerified });
    });

    it('should return true since it is verfied', async () => {
      const isVerified = true;
      const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
      const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(isVerified);
      const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(issuerIdentityMock);
      const req: any = {
        params: {},
        body: vcMock
      };

      await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

      expect(getIdentitySpy).toHaveBeenCalledWith(issuerIdentityId);
      expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(issuerIdentityMock, vcMock);
      expect(getUserSpy).toHaveBeenCalledWith(userMock.userId);
      expect(updateUserVerificationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          verified: isVerified
        })
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith({ isVerified });
    });
  });

  describe('test revokeVerifiableCredential route', () => {
    it('should throw an error since no verfiable credential is found to revoke!', async () => {
      const identityToRevoke = vcMock.id;
      // since we won't have a linkedIdentity for it won't go further
      const linkedIdentity: any = null;
      const getLinkedKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'getLinkedKeyCollectionIdentity').and.returnValue(linkedIdentity);
      const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity');
      const revokeVerifiableCredentialSpy = spyOn(identityService, 'revokeVerifiableCredential');
      const updateIdentityDocSpy = spyOn(IdentitiesDb, 'updateIdentityDoc');
      const revokeKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'revokeKeyCollectionIdentity');
      const updateUserVerificationSpy = spyOn(userService, 'updateUserVerification');
      const req: any = {
        params: {},
        body: { id: identityToRevoke }
      };

      await authenticationRoutes.revokeVerifiableCredential(req, res, nextMock);

      expect(getLinkedKeyCollectionIdentitySpy).toHaveBeenCalledWith(identityToRevoke);
      expect(getIdentitySpy).not.toHaveBeenCalled();
      expect(revokeVerifiableCredentialSpy).not.toHaveBeenCalled();
      expect(updateIdentityDocSpy).not.toHaveBeenCalled();
      expect(revokeKeyCollectionIdentitySpy).not.toHaveBeenCalled();
      expect(updateUserVerificationSpy).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(new Error('no identity found to revoke the verification! maybe the identity is already revoked.'));
    });

    it('should revoke the identity', async () => {
      const identityToRevoke = vcMock.id;
      // since we won't have a linkedIdentity for it won't go further
      const linkedIdentity: LinkedKeyCollectionIdentityPersistence = {
        keyCollectionIndex: 0,
        index: 0,
        linkedIdentity: 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN',
        isRevoked: false,
        revokedIdentity: undefined
      };
      const revokeResult = {
        docUpdate: issuerIdentityMock.doc,
        revoked: true
      };
      const getLinkedKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'getLinkedKeyCollectionIdentity').and.returnValue(linkedIdentity);
      const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(issuerIdentityMock);
      const revokeVerifiableCredentialSpy = spyOn(identityService, 'revokeVerifiableCredential').and.returnValue(revokeResult);
      const updateIdentityDocSpy = spyOn(IdentitiesDb, 'updateIdentityDoc');
      const revokeKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'revokeKeyCollectionIdentity');
      const updateUserVerificationSpy = spyOn(userService, 'updateUserVerification');
      const req: any = {
        params: {},
        body: { id: identityToRevoke }
      };

      await authenticationRoutes.revokeVerifiableCredential(req, res, nextMock);

      expect(getLinkedKeyCollectionIdentitySpy).toHaveBeenCalledWith(identityToRevoke);
      expect(getIdentitySpy).toHaveBeenCalledWith(issuerIdentityId);
      expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(issuerIdentityMock, linkedIdentity.index);
      expect(updateIdentityDocSpy).toHaveBeenCalledWith(revokeResult.docUpdate);
      expect(revokeKeyCollectionIdentitySpy).toHaveBeenCalledWith(linkedIdentity);
      expect(updateUserVerificationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          verified: false
        })
      );
      expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('identity is already revoked', async () => {
      const identityToRevoke = vcMock.id;
      // since we won't have a linkedIdentity for it won't go further
      const linkedIdentity: LinkedKeyCollectionIdentityPersistence = {
        keyCollectionIndex: 0,
        index: 0,
        linkedIdentity: 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN',
        isRevoked: false,
        revokedIdentity: undefined
      };
      const revokeResult = {
        docUpdate: issuerIdentityMock.doc,
        revoked: false
      };
      const getLinkedKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'getLinkedKeyCollectionIdentity').and.returnValue(linkedIdentity);
      const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(issuerIdentityMock);
      const revokeVerifiableCredentialSpy = spyOn(identityService, 'revokeVerifiableCredential').and.returnValue(revokeResult);
      const updateIdentityDocSpy = spyOn(IdentitiesDb, 'updateIdentityDoc');
      const revokeKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'revokeKeyCollectionIdentity');
      const updateUserVerificationSpy = spyOn(userService, 'updateUserVerification');
      const req: any = {
        params: {},
        body: { id: identityToRevoke }
      };

      await authenticationRoutes.revokeVerifiableCredential(req, res, nextMock);

      expect(getLinkedKeyCollectionIdentitySpy).toHaveBeenCalledWith(identityToRevoke);
      expect(getIdentitySpy).toHaveBeenCalledWith(issuerIdentityId);
      expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(issuerIdentityMock, linkedIdentity.index);
      expect(updateIdentityDocSpy).toHaveBeenCalledWith(revokeResult.docUpdate);
      expect(revokeKeyCollectionIdentitySpy).not.toHaveBeenCalled();
      expect(updateUserVerificationSpy).not.toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
    });
  });

  describe('test getLatestDocument route', () => {
    it('should return bad request if no id for the identity is provided!', async () => {
      const getLatestIdentitySpy = spyOn(identityService, 'getLatestIdentity');
      const req: any = {
        params: {},
        body: null
      };

      await authenticationRoutes.getLatestDocument(req, res, nextMock);

      expect(getLatestIdentitySpy).not.toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it('should return the document of the id', async () => {
      const id = 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN';
      const getLatestIdentitySpy = spyOn(identityService, 'getLatestIdentity').and.returnValue(identityDocumentMock);
      const req: any = {
        query: { id },
        body: null
      };

      await authenticationRoutes.getLatestDocument(req, res, nextMock);

      expect(getLatestIdentitySpy).toHaveBeenCalledWith(id);
      expect(res.send).toHaveBeenCalledWith(identityDocumentMock);
    });
  });
});
