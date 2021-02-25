import { IdentityResponse } from '../models/data/identity';
import { UserPersistence } from '../models/data/user';
import { IdentityService } from './identity-service';
import { UserService } from './user-service';

export class AuthenticationService {
  identityService: IdentityService;
  userService: UserService;
  constructor(identityService: IdentityService, userService: UserService) {
    this.identityService = identityService;
    this.userService = userService;
  }

  createIdentity = async (user: UserPersistence): Promise<IdentityResponse> => {
    const identity = await this.identityService.createIdentity();
    const result = await this.userService.addUser(user);

    if (!result?.result?.n) {
      throw new Error('Could not create user identity!');
    }
    return {
      ...identity
    };
  };
}
