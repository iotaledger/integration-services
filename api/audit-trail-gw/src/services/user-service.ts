import * as userDb from '../database/user';

// TODO remove this service and call ssi bridge ms instead
export class UserService {
	async getIdentityId(username: string): Promise<string> {
		const userPersistence = await userDb.getUserByUsername(username);
		return userPersistence?.id;
	}
}
