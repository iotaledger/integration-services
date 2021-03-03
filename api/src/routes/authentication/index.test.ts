import { IdentityConfig } from '../../models/config';
import { IdentityService } from '../../services/identity-service';
import { AuthenticationRoutes } from './index';
import { AuthenticationService } from '../../services/authentication-service';
import { UserService } from '../../services/user-service';
import { StatusCodes } from 'http-status-codes';

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

describe('test authentication routes', () => {
  let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
  let userService: UserService;
  let identityService: IdentityService, authenticationService: AuthenticationService, authenticationRoutes: AuthenticationRoutes;
  beforeEach(() => {
    sendMock = jest.fn();
    sendStatusMock = jest.fn();
    nextMock = jest.fn();
    const config: IdentityConfig = {
      keyCollectionTag: 'key-collection',
      explorer: '',
      network: 'test',
      node: '',
      keyType: 0
    };
    identityService = IdentityService.getInstance(config);
    userService = new UserService();
    authenticationService = new AuthenticationService(identityService, userService);
    authenticationRoutes = new AuthenticationRoutes(authenticationService);

    res = {
      send: sendMock,
      sendStatus: sendStatusMock,
      status: jest.fn(() => res)
    };
  });

  describe('test create-identity route', () => {
    it('should call error if not valid body', () => {
      const req: any = {
        params: {},
        body: {}
      };
      authenticationRoutes.createIdentity(req, res, nextMock);
      expect(nextMock).toHaveBeenCalled();
    });
    it('should send result for valid body', async () => {
      const identitySpy = spyOn(identityService, 'createIdentity').and.returnValue(identityDocumentMock);
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
        userId: 'AavQx5RH1c1zcHbUtwMEq9UVzdPKfPV1bXKxTsvW6b7D',
        username: 'test-username'
      };
      await authenticationRoutes.createIdentity(req, res, nextMock);
      expect(identitySpy).toHaveBeenCalledWith();
      expect(userSpy).toHaveBeenCalledWith(exptectedUser);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.send).toHaveBeenCalledWith(identityDocumentMock);
    });
  });
});
