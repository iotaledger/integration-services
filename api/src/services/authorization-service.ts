import { UserService } from './user-service';
import { AuthorizationCheck } from '../models/types/authentication';
import { User, UserClassification, UserRoles } from '../models/types/user';

export class AuthorizationService {
	private readonly error: Error = new Error('not allowed!');
	private readonly userService: UserService;

	constructor(userService: UserService) {
		this.userService = userService;
	}

	isAuthorized = async (requestUser: User, userId: string): Promise<AuthorizationCheck> => {
		const isAuthorizedUser = this.isAuthorizedUser(requestUser.userId, userId);
		if (!isAuthorizedUser) {
			const isAuthorizedAdmin = await this.isAuthorizedAdmin(requestUser, userId);
			if (!isAuthorizedAdmin) {
				return { isAuthorized: false, error: this.error };
			}
		}
		return { isAuthorized: true, error: null };
	};

	isAuthorizedUser = (requestUserId: string, userId: string): boolean => {
		const requestUid = requestUserId;

		if (requestUid !== userId) {
			return false;
		}

		return true;
	};

	isAuthorizedAdmin = async (requestUser: User, userId: string): Promise<boolean> => {
		const role = requestUser.role;
		if (!this.isUserOrApi(requestUser.classification)) {
			return false;
		}

		if (role === UserRoles.Admin) {
			return true;
		} else if (role === UserRoles.OrgAdmin) {
			const user = await this.userService.getUser(userId);
			const hasSameOrganization = requestUser.organization === user?.organization;
			if (hasSameOrganization) {
				return true;
			}
		}
		return false;
	};

	isUserOrApi(classification: UserClassification | string): boolean {
		return classification === UserClassification.human || classification === UserClassification.api;
	}
}
