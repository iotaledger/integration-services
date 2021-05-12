import { UserService } from './user-service';
import { AuthorizationCheck } from '../models/types/authentication';
import { User, UserType, UserRoles } from '../models/types/user';

export class AuthorizationService {
	private readonly userService: UserService;

	constructor(userService: UserService) {
		this.userService = userService;
	}

	isAuthorized = async (requestUser: User, userId: string): Promise<AuthorizationCheck> => {
		const isAuthorizedUser = this.isAuthorizedUser(requestUser.userId, userId);
		if (!isAuthorizedUser) {
			const isAuthorizedAdmin = await this.isAuthorizedAdmin(requestUser, userId);
			if (!isAuthorizedAdmin) {
				return { isAuthorized: false, error: new Error('not allowed!') };
			}
		}
		return { isAuthorized: true, error: null };
	};

	isAuthorizedUser = (requestUserId: string, userId: string): boolean => {
		return requestUserId === userId;
	};

	isAuthorizedAdmin = async (requestUser: User, userId: string): Promise<boolean> => {
		const role = requestUser.role;
		if (!this.hasAuthorizationType(requestUser.type)) {
			return false;
		}

		if (role === UserRoles.Admin) {
			return true;
		} else if (role === UserRoles.Manager) {
			const user = await this.userService.getUser(userId);
			const hasSameOrganization = requestUser.organization === user?.organization;
			if (hasSameOrganization) {
				return true;
			}
		}
		return false;
	};

	hasAuthorizationType(type: UserType | string): boolean {
		return type === UserType.Person || type === UserType.Service || type === UserType.Organization;
	}
}
