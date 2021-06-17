import { UserService } from './user-service';
import { AuthorizationCheck, CredentialTypes } from '../models/types/verification';
import { User, UserType, UserRoles } from '../models/types/user';

export class AuthorizationService {
	constructor(private readonly userService: UserService) {}

	isAuthorized = async (requestUser: User, identityId: string): Promise<AuthorizationCheck> => {
		const isAuthorizedUser = this.isAuthorizedUser(requestUser.identityId, identityId);
		if (!isAuthorizedUser) {
			const isAuthorizedAdmin = await this.isAuthorizedAdmin(requestUser, identityId);
			if (!isAuthorizedAdmin) {
				return { isAuthorized: false, error: new Error('not allowed!') };
			}
		}
		return { isAuthorized: true, error: null };
	};

	isAuthorizedUser = (requestUserId: string, identityId: string): boolean => {
		return requestUserId === identityId;
	};

	isAuthorizedAdmin = async (requestUser: User, identityId: string): Promise<boolean> => {
		const role = requestUser.role;
		if (!this.hasAuthorizedUserType(requestUser.type)) {
			return false;
		}

		if (role === UserRoles.Admin) {
			return true;
		} else if (role === UserRoles.Manager) {
			const user = await this.userService.getUser(identityId);
			const hasSameOrganization = requestUser.organization === user?.organization;
			if (hasSameOrganization) {
				return true;
			}
		}
		return false;
	};

	hasAuthorizedUserType(type: string): boolean {
		return type === UserType.Person || type === UserType.Service || type === UserType.Organization;
	}

	hasVerificationCredentialType(type: string[]): boolean {
		return type.some((t) => t === CredentialTypes.VerifiedIdentityCredential);
	}
}
