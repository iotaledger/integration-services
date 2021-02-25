import { IdentityConfig } from '../../models/config';
import { IdentityService } from '../../services/identity-service';
import { AuthenticationRoutes } from './index';
import { AuthenticationService } from '../../services/authentication-service';
import { UserService } from '../../services/user-service';

describe('test authentication routes', () => {
  let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
  let userService: UserService;
  let identityService: IdentityService, authenticationService: AuthenticationService, authenticationRoutes: AuthenticationRoutes;
  beforeEach(() => {
    sendMock = jest.fn();
    sendStatusMock = jest.fn();
    nextMock = jest.fn();
    const config: IdentityConfig = {
      explorer: '',
      network: 'test',
      node: ''
    };
    identityService = IdentityService.getInstance(config);
    userService = new UserService();
    authenticationService = new AuthenticationService(identityService, userService);
    authenticationRoutes = new AuthenticationRoutes(authenticationService);

    res = {
      send: sendMock,
      sendStatus: sendStatusMock
    };
  });

  describe('test create-identity route', () => {
    it('should call error', () => {
      const req: any = {
        params: {},
        body: null
      };
      authenticationRoutes.createIdentity(req, res, nextMock);
    });
  });
});
