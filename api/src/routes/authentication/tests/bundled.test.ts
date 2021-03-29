import { IdentityConfig } from '../../../models/config';
import { IdentityService } from '../../../services/identity-service';
import { AuthenticationRoutes } from '../index';
import { AuthenticationService } from '../../../services/authentication-service';
import { UserService } from '../../../services/user-service';
import { StatusCodes } from 'http-status-codes';
import * as IdentitiesDb from '../../../database/identities';
import * as AuthDb from '../../../database/auth';
import { User } from '../../../models/types/user';
import * as EncryptionUtils from '../../../utils/encryption';
import { ServerIdentityMock, UserIdentityMock } from '../../../test/mocks/identities';

const validUserMock = UserIdentityMock.userData;

describe('test authentication routes', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let userService: UserService;
	let identityService: IdentityService, authenticationService: AuthenticationService, authenticationRoutes: AuthenticationRoutes;
	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config: any = {
			serverIdentityId: ServerIdentityMock.doc.id
		};
		const identityConfig: IdentityConfig = {
			keyCollectionTag: 'key-collection',
			explorer: '',
			network: 'test',
			node: '',
			keyType: 0,
			hashFunction: 0,
			hashEncoding: 'base58'
		};
		identityService = IdentityService.getInstance(identityConfig);
		userService = new UserService();
		authenticationService = new AuthenticationService(identityService, userService, {
			jwtExpiration: '2 days',
			serverSecret: 'very-secret-secret',
			serverIdentityId: ServerIdentityMock.doc.id
		});
		authenticationRoutes = new AuthenticationRoutes(authenticationService, userService, config);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	describe('test create-identity route', () => {
		it('should send result for valid body', async () => {
			const identitySpy = spyOn(identityService, 'createIdentity').and.returnValue(UserIdentityMock);
			const saveIdentitySpy = spyOn(IdentitiesDb, 'saveIdentity').and.returnValue(UserIdentityMock);
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
				userId: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
				publicKey: '8WaGsr277JQaqV9fxHmFNGC9haApFbBfdnytmq5gq4vm',
				username: 'test-username'
			};
			await authenticationRoutes.createIdentity(req, res, nextMock);
			expect(identitySpy).toHaveBeenCalledWith();
			expect(userSpy).toHaveBeenCalledWith(exptectedUser);
			expect(saveIdentitySpy).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
			expect(res.send).toHaveBeenCalledWith(UserIdentityMock);
		});

		it('should save the identity since it is called to with storeIdentity=true', async () => {
			const identitySpy = spyOn(identityService, 'createIdentity').and.returnValue(UserIdentityMock);
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
				userId: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
				publicKey: '8WaGsr277JQaqV9fxHmFNGC9haApFbBfdnytmq5gq4vm',
				username: 'test-username'
			};
			await authenticationRoutes.createIdentity(req, res, nextMock);
			expect(identitySpy).toHaveBeenCalledWith();
			expect(userSpy).toHaveBeenCalledWith(exptectedUser);
			expect(saveIdentitySpy).toHaveBeenCalledWith(UserIdentityMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
			expect(res.send).toHaveBeenCalledWith(UserIdentityMock);
		});
	});

	describe('test getLatestDocument route', () => {
		it('should return bad request if no id for the identity is provided!', async () => {
			const getLatestIdentitySpy = spyOn(identityService, 'getLatestIdentityJson');
			const req: any = {
				params: {},
				body: null
			};

			await authenticationRoutes.getLatestDocument(req, res, nextMock);

			expect(getLatestIdentitySpy).not.toHaveBeenCalled();
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		});

		it('should return the document of the id', async () => {
			const id = 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4';
			const getLatestIdentitySpy = spyOn(identityService, 'getLatestIdentityJson').and.returnValue(UserIdentityMock);
			const req: any = {
				query: { id },
				body: null
			};

			await authenticationRoutes.getLatestDocument(req, res, nextMock);

			expect(getLatestIdentitySpy).toHaveBeenCalledWith(id);
			expect(res.send).toHaveBeenCalledWith(UserIdentityMock);
		});
	});

	describe('test getChallenge route', () => {
		it('should return bad request because no userId provided.', async () => {
			const userMock: User = null;

			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const upsertChallengeSpy = spyOn(AuthDb, 'upsertChallenge');
			const req: any = {
				params: { userId: null },
				body: null
			};

			await authenticationRoutes.getChallenge(req, res, nextMock);

			expect(getUserSpy).not.toHaveBeenCalled();
			expect(upsertChallengeSpy).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'A userId must be provided to the request path!' });
		});

		it('should throw an error since no user with the userId is found', async () => {
			const userMock: User = null;
			const userId = 'NO_USER_FOUND_WITH_THIS_ID';
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const upsertChallengeSpy = spyOn(AuthDb, 'upsertChallenge');
			const req: any = {
				params: { userId },
				body: null
			};

			await authenticationRoutes.getChallenge(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalled();
			expect(upsertChallengeSpy).not.toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(new Error(`no user with id: ${userId} found!`));
		});
		it('should return a valid challenge to solve', async () => {
			const userId = 'did:iota:BfaKRQcBB5G6Kdg7w7HESaVhJfJcQFgg3VSijaWULDwk';
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(validUserMock);
			const upsertChallengeSpy = spyOn(AuthDb, 'upsertChallenge');
			const req: any = {
				params: { userId },
				body: null
			};

			await authenticationRoutes.getChallenge(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(userId);
			expect(upsertChallengeSpy).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalled();
		});
	});

	describe('test auth route', () => {
		it('should return bad request because no userId provided.', async () => {
			const req: any = {
				params: { userId: null },
				body: { signedChallenge: 'SIGNED_CHALLENGE' }
			};

			await authenticationRoutes.auth(req, res, nextMock);

			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		});
		it('should return bad request because no signedChallenge is provided in the body.', async () => {
			const req: any = {
				params: { userId: 'USERID' },
				body: null
			};

			await authenticationRoutes.auth(req, res, nextMock);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		});

		it('should throw error since no user found', async () => {
			const userMock: User = null;
			const userId = 'did:iota:BfaKRQcBB5G6Kdg7w7HESaVhJfJcQFgg3VSijaWULDwk';
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const req: any = {
				params: { userId },
				body: { signedChallenge: 'SIGNED_CHALLENGE' }
			};

			await authenticationRoutes.auth(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(userId);
			expect(nextMock).toHaveBeenCalledWith(new Error(`no user with id: ${userId} found!`));
		});

		it('should throw error for a challenge which is verified=false', async () => {
			const verified = false;
			const userMock: User = validUserMock;
			const userId = 'did:iota:BfaKRQcBB5G6Kdg7w7HESaVhJfJcQFgg3VSijaWULDwk';

			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const getChallengeSpy = spyOn(AuthDb, 'getChallenge').and.returnValue({ challenge: 'CHALLENGE_TO_SOLVE' });
			const verifiyChallengeSpy = spyOn(EncryptionUtils, 'verifiyChallenge').and.returnValue(verified);
			const req: any = {
				params: { userId },
				body: { signedChallenge: 'SIGNED_CHALLENGE' }
			};

			await authenticationRoutes.auth(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(userId);
			expect(getChallengeSpy).toHaveBeenCalledWith(userId);
			expect(verifiyChallengeSpy).toHaveBeenCalledWith(
				'6f9546516cfafef9e544ac7e0092a075b4a253ff4e26c3b53513f8ddc832200a',
				'CHALLENGE_TO_SOLVE',
				'SIGNED_CHALLENGE'
			);
			expect(nextMock).toHaveBeenCalledWith(new Error(`signed challenge is not valid!`));
		});

		it('should return the jwt for challenge which is verified=true', async () => {
			const verified = true;
			const userMock: User = validUserMock;
			const userId = 'did:iota:BfaKRQcBB5G6Kdg7w7HESaVhJfJcQFgg3VSijaWULDwk';
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const getChallengeSpy = spyOn(AuthDb, 'getChallenge').and.returnValue({ challenge: 'CHALLENGE_TO_SOLVE' });
			const verifiyChallengeSpy = spyOn(EncryptionUtils, 'verifiyChallenge').and.returnValue(verified);
			const req: any = {
				params: { userId },
				body: { signedChallenge: 'SIGNED_CHALLENGE' }
			};

			await authenticationRoutes.auth(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(userId);
			expect(getChallengeSpy).toHaveBeenCalledWith(userId);
			expect(verifiyChallengeSpy).toHaveBeenCalledWith(
				'6f9546516cfafef9e544ac7e0092a075b4a253ff4e26c3b53513f8ddc832200a',
				'CHALLENGE_TO_SOLVE',
				'SIGNED_CHALLENGE'
			);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalled();
		});
	});
});
