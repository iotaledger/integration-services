import { AuthorizationCheck, CredentialTypes } from '../models/types/verification';
import { User, UserType, UserRoles } from '../models/types/user';

export class AuthorizationService {
	isAuthorized(requestUser: User, id: string): AuthorizationCheck {
		const isAuthorizedUser = this.isAuthorizedUser(requestUser.id, id);
		if (!isAuthorizedUser) {
			const isAuthorizedAdmin = this.isAuthorizedAdmin(requestUser);
			if (!isAuthorizedAdmin) {
				return { isAuthorized: false, error: new Error('not allowed!') };
			}
		}
		return { isAuthorized: true, error: null };
	}

	isAuthorizedUser(requestUserId: string, id: string): boolean {
		return requestUserId === id;
	}

	isAuthorizedAdmin(requestUser: User): boolean {
		const role = requestUser?.role;

		if (role === UserRoles.Admin) {
			return true;
		}
		return false;
	}

	hasAuthorizedUserType(type: string): boolean {
		return type === UserType.Person || type === UserType.Service || type === UserType.Organization;
	}

	hasVerificationCredentialType(type: string[]): boolean {
		return type.some((t) => t === CredentialTypes.VerifiedIdentityCredential);
	}
}
