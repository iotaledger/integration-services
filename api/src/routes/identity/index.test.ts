import { IdentityRoutes } from '.';
import * as UserDb from '../../database/user';
import * as IdentityDocsDb from '../../database/identity-docs';
import { IdentityConfig } from '../../models/config';
import { UserPersistence, UserType, User, UserSearch, IdentityClaim } from '../../models/types/user';
import { AuthorizationService } from '../../services/authorization-service';
import { SsiService } from '../../services/ssi-service';
import { UserService } from '../../services/user-service';
import { TestUsersMock, UserIdentityMock } from '../../test/mocks/identities';
import { getDateFromString, getDateStringFromDate } from '../../utils/date';
import { StatusCodes } from 'http-status-codes';
import { LoggerMock } from '../../test/mocks/logger';
import { IdentityConfigMock } from '../../test/mocks/config';

describe('test user routes', () => {
	const serverSecret = 'very-secret-secret';
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any, userService: UserService, userRoutes: IdentityRoutes, ssiService: SsiService;
	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();

		const identityConfig: IdentityConfig = IdentityConfigMock;
		ssiService = SsiService.getInstance(identityConfig, LoggerMock);
		userService = new UserService(ssiService as any, serverSecret, LoggerMock);
		const authorizationService = new AuthorizationService();
		userRoutes = new IdentityRoutes(userService, authorizationService, LoggerMock);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});
	describe('test search route', () => {
		it('should call searchUser with expected user search', async () => {
			const expectedUserSearch: UserSearch = {
				type: UserType.Person,
				index: 1,
				limit: 1,
				username: 'charlie',
				registrationDate: getDateFromString('2021-02-12T14:58:05+01:00')
			};
			const searchUserSpy = spyOn(UserDb, 'searchUsers').and.returnValue([]);
			const req: any = {
				params: {},
				query: {
					type: 'Person',
					'registration-date': '2021-02-12T14:58:05+01:00',
					limit: '1',
					index: '1',
					username: 'charlie',
					'subscribed-channel-ids': ['test-address', 'test-address2']
				},
				body: null
			};

			await userRoutes.searchUsers(req, res, nextMock);

			expect(searchUserSpy).toHaveBeenCalledWith(expectedUserSearch);
		});
	});

	describe('test GET user', () => {
		it('should return bad request if no user id is given as parameter', async () => {
			const req: any = {
				params: {},
				body: null
			};

			await userRoutes.getUser(req, res, nextMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'no identityId provided' });
		});
		it('should return expected user', async () => {
			const date = getDateFromString('2021-02-12T14:58:05+01:00');
			const user: UserPersistence = {
				identityId: 'did:iota:2QQd1DN1ZjnXnvSAaAjk1VveBNUYDw7eE9bTTCC4RbG4',
				publicKey: 'my-public-key-1',
				username: 'first-user',
				claim: { type: UserType.Person, firstName: 'Tom', lastName: 'Tomson' } as IdentityClaim,
				registrationDate: date
			};
			const getUserSpy = spyOn(UserDb, 'getUser').and.returnValue(user);
			const req: any = {
				params: { identityId: 'did:iota:2QQd1DN1ZjnXnvSAaAjk1VveBNUYDw7eE9bTTCC4RbG4' },
				body: null,
				user: TestUsersMock[0]
			};

			await userRoutes.getUser(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledTimes(1);
			expect(sendMock).toHaveBeenCalledWith({
				identityId: 'did:iota:2QQd1DN1ZjnXnvSAaAjk1VveBNUYDw7eE9bTTCC4RbG4',
				publicKey: 'my-public-key-1',
				username: 'first-user',
				claim: { type: 'Person', firstName: 'Tom', lastName: 'Tomson' },
				registrationDate: getDateStringFromDate(date)
			});
		});

		it('should not return private claim but public fields', async () => {
			const requestUser = TestUsersMock[0];
			const date = getDateFromString('2021-02-12T14:58:05+01:00');
			const user: UserPersistence = {
				identityId: 'did:iota:2QQd1DN1ZjnXnvSAaAjk1VveBNUYDw7eE9bTTCC4RbG4',
				publicKey: 'my-public-key-1',
				username: 'first-user',
				claim: { type: UserType.Person, firstName: 'Tom', lastName: 'Tomson' } as IdentityClaim,
				registrationDate: date,
				isPrivate: true
			};
			const getUserSpy = spyOn(UserDb, 'getUser').and.returnValue(user);
			const req: any = {
				params: { identityId: 'did:iota:2QQd1DN1ZjnXnvSAaAjk1VveBNUYDw7eE9bTTCC4RbG4' },
				body: null,
				user: requestUser
			};

			const expectedResponse: User = {
				identityId: 'did:iota:2QQd1DN1ZjnXnvSAaAjk1VveBNUYDw7eE9bTTCC4RbG4',
				publicKey: 'my-public-key-1',
				username: 'first-user',
				claim: undefined, // claim is undefined since user id and requester is different
				registrationDate: getDateStringFromDate(date),
				isPrivate: true
			};
			await userRoutes.getUser(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledTimes(1);
			expect(sendMock).toHaveBeenCalledWith(expectedResponse);
		});

		it('should also return private claims since requestUser is same user as requested user', async () => {
			const requestUser = TestUsersMock[0];
			const date = getDateFromString('2021-02-12T14:58:05+01:00');
			const user: UserPersistence = {
				identityId: requestUser.identityId,
				publicKey: 'my-public-key-1',
				username: 'first-user',
				claim: { type: UserType.Person, firstName: 'Tom', lastName: 'Tomson' } as IdentityClaim,
				registrationDate: date,
				isPrivate: true
			};
			const getUserSpy = spyOn(UserDb, 'getUser').and.returnValue(user);
			const req: any = {
				params: { identityId: requestUser.identityId }, // same identityId as requestUser
				body: null,
				user: requestUser
			};

			const expectedResponse: User = {
				identityId: requestUser.identityId,
				publicKey: 'my-public-key-1',
				username: 'first-user',
				claim: { type: UserType.Person, firstName: 'Tom', lastName: 'Tomson' } as IdentityClaim, // claim is not undefined since is the same user
				registrationDate: getDateStringFromDate(date),
				isPrivate: true
			};
			await userRoutes.getUser(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledTimes(1);
			expect(sendMock).toHaveBeenCalledWith(expectedResponse);
		});

		it('should call next(err) if an error occurs when reading from db', async () => {
			const loggerSpy = spyOn(LoggerMock, 'error');
			const getUserSpy = spyOn(UserDb, 'getUser').and.callFake(() => {
				throw new Error('Test error');
			});
			const req: any = {
				params: { identityId: 'did:iota:2QQd1DN1ZjnXnvSAaAjk1VveBNUYDw7eE9bTTCC4RbG4' },
				body: null,
				user: TestUsersMock[0]
			};

			await userRoutes.getUser(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledTimes(1);
			expect(sendMock).not.toHaveBeenCalled();
			expect(loggerSpy).toHaveBeenCalledWith(new Error('Test error'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not get the identity'));
		});
	});

	describe('test POST user', () => {
		const validBody: User = {
			identityId: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4', // must be same as in UserIdentityMock.id
			publicKey: '8WaGsr277JQaqV9fxHmFNGC9haApFbBfdnytmq5gq4vm', // must be same as in UserIdentityMock publicKeyBase58
			username: 'first-user',
			claim: { type: UserType.Person, firstName: 'Tom', lastName: 'Sonson' } as IdentityClaim,
			registrationDate: '2021-02-12T14:58:05+01:00'
		};

		it('should return bad request if no valid body is given', async () => {
			const req: any = {
				params: {},
				body: null
			};

			await userRoutes.addUser(req, res, nextMock);
			expect(nextMock).toHaveBeenCalled();
		});

		it('should return 404 since no user added', async () => {
			const loggerSpy = spyOn(LoggerMock, 'error');
			const addUserSpy = spyOn(UserDb, 'addUser').and.returnValue({ result: { n: 0 } }); // no user added
			const getLatestDocSpy = spyOn(ssiService, 'getLatestIdentityJson').and.returnValue({ document: UserIdentityMock.doc, messageId: '' });

			const req: any = {
				params: {},
				body: validBody
			};

			await userRoutes.addUser(req, res, nextMock);

			expect(addUserSpy).toHaveBeenCalledTimes(1);
			expect(getLatestDocSpy).toHaveBeenCalledTimes(1);
			expect(loggerSpy).toHaveBeenCalledWith(new Error('could not create user identity!'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not add the identity'));
		});
		it('should add user', async () => {
			const getLatestDocSpy = spyOn(ssiService, 'getLatestIdentityJson').and.returnValue({ document: UserIdentityMock.doc, messageId: '' });
			const addUserSpy = spyOn(UserDb, 'addUser').and.returnValue({ result: { n: 1 } });

			const req: any = {
				params: {},
				body: validBody
			};

			await userRoutes.addUser(req, res, nextMock);

			expect(addUserSpy).toHaveBeenCalledTimes(1);
			expect(getLatestDocSpy).toHaveBeenCalledTimes(1);
			expect(sendStatusMock).toHaveBeenCalledWith(201);
		});

		it('should call next(err) if an error occurs when adding to db', async () => {
			const loggerSpy = spyOn(LoggerMock, 'error');
			const getLatestDocSpy = spyOn(ssiService, 'getLatestIdentityJson').and.returnValue({ document: UserIdentityMock.doc, messageId: '' });
			const addUserSpy = spyOn(UserDb, 'addUser').and.callFake(() => {
				throw new Error('Test error');
			});
			const req: any = {
				params: {},
				body: validBody
			};

			await userRoutes.addUser(req, res, nextMock);

			expect(addUserSpy).toHaveBeenCalledTimes(1);
			expect(getLatestDocSpy).toHaveBeenCalledTimes(1);
			expect(sendMock).not.toHaveBeenCalled();
			expect(loggerSpy).toHaveBeenCalledWith(new Error('Test error'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not add the identity'));
		});
	});

	describe('test create-identity route', () => {
		it('should send result for valid body', async () => {
			const identitySpy = spyOn(ssiService, 'createIdentity').and.returnValue(UserIdentityMock);
			const saveIdentitySpy = spyOn(IdentityDocsDb, 'saveIdentity').and.returnValue(UserIdentityMock);
			const userSpy = spyOn(userService, 'addUser').and.returnValue({ result: { n: 1 } });
			const req: any = {
				params: {},
				body: {
					username: 'test-username',
					claim: { type: 'Person', firstName: 'Mister', lastName: 'Subscriber' }
				}
			};

			const exptectedUser = {
				claim: { type: 'Person', firstName: 'Mister', lastName: 'Subscriber' },
				identityId: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
				publicKey: '8WaGsr277JQaqV9fxHmFNGC9haApFbBfdnytmq5gq4vm',
				username: 'test-username'
			};
			await userRoutes.createIdentity(req, res, nextMock);
			expect(identitySpy).toHaveBeenCalledWith();
			expect(userSpy).toHaveBeenCalledWith(exptectedUser);
			expect(saveIdentitySpy).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
			expect(res.send).toHaveBeenCalledWith(UserIdentityMock);
		});

		it('should save the identity since it is called to with storeIdentity=true', async () => {
			const identitySpy = spyOn(ssiService, 'createIdentity').and.returnValue(UserIdentityMock);
			const saveIdentitySpy = spyOn(IdentityDocsDb, 'saveIdentity');
			const userSpy = spyOn(userService, 'addUser').and.returnValue({ result: { n: 1 } });
			const req: any = {
				params: {},
				body: {
					username: 'test-username',
					claim: { type: 'Person', firstName: 'Mister', lastName: 'Subscriber' },
					storeIdentity: true
				}
			};

			const exptectedUser = {
				claim: { type: 'Person', firstName: 'Mister', lastName: 'Subscriber' },
				storeIdentity: true,
				identityId: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
				publicKey: '8WaGsr277JQaqV9fxHmFNGC9haApFbBfdnytmq5gq4vm',
				username: 'test-username'
			};
			await userRoutes.createIdentity(req, res, nextMock);
			expect(identitySpy).toHaveBeenCalledWith();
			expect(userSpy).toHaveBeenCalledWith(exptectedUser);
			expect(saveIdentitySpy).toHaveBeenCalledWith(UserIdentityMock, serverSecret);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
			expect(res.send).toHaveBeenCalledWith(UserIdentityMock);
		});
	});

	describe('test PUT user', () => {
		const validBody: User = {
			identityId: 'did:iota:2QQd1DN1ZjnXnvSAaAjk1VveBNUYDw7eE9bTTCC4RbG4',
			publicKey: 'my-public-key-1',
			username: 'first-user',
			claim: { type: UserType.Person, firstName: 'Tom', lastName: 'Sonson' } as IdentityClaim,
			registrationDate: '2021-02-12T14:58:05+01:00'
		};

		it('should return bad request if no valid body is given', async () => {
			const req: any = {
				params: {},
				body: null
			};

			await userRoutes.updateUser(req, res, nextMock);
			expect(nextMock).toHaveBeenCalled();
		});

		it('should return 404 since no user updated', async () => {
			const updateUserSpy = spyOn(UserDb, 'updateUser').and.returnValue({ result: { n: 0 } });

			const req: any = {
				user: { identityId: validBody.identityId },
				params: {},
				body: validBody
			};

			await userRoutes.updateUser(req, res, nextMock);

			expect(updateUserSpy).toHaveBeenCalledTimes(1);
			expect(res.send).toHaveBeenCalledWith({ error: 'No user found to update!' });
			expect(res.status).toHaveBeenCalledWith(404);
		});

		it('is not authorized to update the user', async () => {
			const loggerSpy = spyOn(LoggerMock, 'error');
			const updateUserSpy = spyOn(UserDb, 'updateUser').and.returnValue({ result: { n: 1 } });

			const req: any = {
				user: { identityId: 'did:iota:123456789' }, // different request identityId than user to update
				params: {},
				body: validBody
			};

			await userRoutes.updateUser(req, res, nextMock);

			expect(updateUserSpy).toHaveBeenCalledTimes(0);
			expect(loggerSpy).toHaveBeenCalledWith(new Error('not allowed!'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not update the identity'));
		});

		it('should update expected user', async () => {
			const updateUserSpy = spyOn(UserDb, 'updateUser').and.returnValue({ result: { n: 1 } });

			const req: any = {
				user: { identityId: validBody.identityId },
				params: {},
				body: validBody
			};

			await userRoutes.updateUser(req, res, nextMock);

			expect(updateUserSpy).toHaveBeenCalledTimes(1);
			expect(sendStatusMock).toHaveBeenCalledWith(200);
		});

		it('should call next(err) if an error occurs when updating the db', async () => {
			const loggerSpy = spyOn(LoggerMock, 'error');
			const updateUserSpy = spyOn(UserDb, 'updateUser').and.callFake(() => {
				throw new Error('Test error');
			});
			const req: any = {
				user: { identityId: validBody.identityId },
				params: {},
				body: validBody
			};

			await userRoutes.updateUser(req, res, nextMock);

			expect(updateUserSpy).toHaveBeenCalledTimes(1);
			expect(sendMock).not.toHaveBeenCalled();
			expect(loggerSpy).toHaveBeenCalledWith(new Error('Test error'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not update the identity'));
		});
	});

	describe('test DELETE user', () => {
		it('should return bad request if no address is given as parameter', async () => {
			const req: any = {
				params: {},
				body: null
			};

			await userRoutes.deleteUser(req, res, nextMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'no identityId provided' });
		});

		it('is not authorized to delete different user', async () => {
			const loggerSpy = spyOn(LoggerMock, 'error');
			const deleteUserSpy = spyOn(UserDb, 'deleteUser');

			const req: any = {
				user: { identityId: 'did:iota:123456789' },
				params: { identityId: 'did:iota:2QQd1DN1ZjnXnvSAaAjk1VveBNUYDw7eE9bTTCC4RbG4' },
				body: null
			};

			await userRoutes.deleteUser(req, res, nextMock);

			expect(deleteUserSpy).toHaveBeenCalledTimes(0);
			expect(loggerSpy).toHaveBeenCalledWith(new Error('not allowed!'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not delete the identity'));
		});

		it('should delete expected user', async () => {
			const deleteUserSpy = spyOn(UserDb, 'deleteUser');

			const req: any = {
				user: { identityId: 'did:iota:2QQd1DN1ZjnXnvSAaAjk1VveBNUYDw7eE9bTTCC4RbG4' },
				params: { identityId: 'did:iota:2QQd1DN1ZjnXnvSAaAjk1VveBNUYDw7eE9bTTCC4RbG4' },
				body: null
			};

			await userRoutes.deleteUser(req, res, nextMock);

			expect(deleteUserSpy).toHaveBeenCalledTimes(1);
			expect(sendStatusMock).toHaveBeenCalledWith(200);
		});

		it('should call next(err) if an error occurs when removing from db', async () => {
			const loggerSpy = spyOn(LoggerMock, 'error');
			const deleteUserSpy = spyOn(UserDb, 'deleteUser').and.callFake(() => {
				throw new Error('Test error');
			});
			const req: any = {
				user: { identityId: 'did:iota:2QQd1DN1ZjnXnvSAaAjk1VveBNUYDw7eE9bTTCC4RbG4' },
				params: { identityId: 'did:iota:2QQd1DN1ZjnXnvSAaAjk1VveBNUYDw7eE9bTTCC4RbG4' },
				body: null
			};
			await userRoutes.deleteUser(req, res, nextMock);

			expect(deleteUserSpy).toHaveBeenCalledTimes(1);
			expect(sendMock).not.toHaveBeenCalled();
			expect(loggerSpy).toHaveBeenCalledWith(new Error('Test error'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not delete the identity'));
		});
	});
});
