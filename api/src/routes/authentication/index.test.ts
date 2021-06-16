import { AuthenticationRoutes } from './index';
import { AuthenticationService } from '../../services/authentication-service';
import { UserService } from '../../services/user-service';
import { StatusCodes } from 'http-status-codes';
import * as AuthDb from '../../database/auth';
import { User } from '../../models/types/user';
import * as EncryptionUtils from '../../utils/encryption';
import { UserIdentityMock } from '../../test/mocks/identities';
import { SsiService } from '../../services/ssi-service';
import { IdentityConfig } from '../../models/config';

const validUserMock = UserIdentityMock.userData;

describe('test authentication routes', () => {
	const serverSecret = 'very-secret-secret';
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let userService: UserService, ssiService: SsiService;
	let authenticationService: AuthenticationService, authenticationRoutes: AuthenticationRoutes;
	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const identityConfig: IdentityConfig = {
			keyCollectionTag: 'key-collection',
			explorer: '',
			network: 'test',
			node: '',
			keyType: 0,
			hashFunction: 0,
			hashEncoding: 'base58'
		};
		ssiService = SsiService.getInstance(identityConfig);
		userService = new UserService(ssiService, serverSecret);
		authenticationService = new AuthenticationService(userService, ssiService, {
			jwtExpiration: '2 days',
			serverSecret
		});
		authenticationRoutes = new AuthenticationRoutes(authenticationService, userService);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	describe('test getNonce route', () => {
		it('should return bad request because no identityId provided.', async () => {
			const userMock: User = null;

			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const upsertNonceSpy = spyOn(AuthDb, 'upsertNonce');
			const req: any = {
				params: { identityId: null },
				body: null
			};

			await authenticationRoutes.getNonce(req, res, nextMock);

			expect(getUserSpy).not.toHaveBeenCalled();
			expect(upsertNonceSpy).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'A identityId must be provided to the request path!' });
		});

		it('should return a valid nonce to solve', async () => {
			const identityId = 'did:iota:BfaKRQcBB5G6Kdg7w7HESaVhJfJcQFgg3VSijaWULDwk';
			const upsertNonceSpy = spyOn(AuthDb, 'upsertNonce');
			const req: any = {
				params: { identityId },
				body: null
			};

			await authenticationRoutes.getNonce(req, res, nextMock);

			expect(upsertNonceSpy).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalled();
		});
	});

	describe('test auth route', () => {
		it('should return bad request because no identityId provided.', async () => {
			const req: any = {
				params: { identityId: null },
				body: { signedNonce: 'SIGNED_NONCE' }
			};

			await authenticationRoutes.proveOwnership(req, res, nextMock);

			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		});
		it('should return bad request because no signedNonce is provided in the body.', async () => {
			const req: any = {
				params: { identityId: 'identityid' },
				body: null
			};

			await authenticationRoutes.proveOwnership(req, res, nextMock);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		});

		it('should throw error since no user found', async () => {
			const userMock: User = null;
			const identityId = 'did:iota:BfaKRQcBB5G6Kdg7w7HESaVhJfJcQFgg3VSijaWULDwk';
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const getLatestIdentitySpy = spyOn(ssiService, 'getLatestIdentityDoc').and.returnValue(null);
			const req: any = {
				params: { identityId },
				body: { signedNonce: 'SIGNED_NONCE' }
			};

			await authenticationRoutes.proveOwnership(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(identityId);
			expect(getLatestIdentitySpy).toHaveBeenCalledWith(identityId);
			expect(nextMock).toHaveBeenCalledWith(new Error(`no identity with id: ${identityId} found!`));
		});

		it('should throw error for a nonce which is verified=false', async () => {
			const verified = false;
			const userMock: User = validUserMock;
			const identityId = 'did:iota:BfaKRQcBB5G6Kdg7w7HESaVhJfJcQFgg3VSijaWULDwk';

			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const getNonceSpy = spyOn(AuthDb, 'getNonce').and.returnValue({ nonce: 'as23jweoifwefjiasdfoasdfasdasdawd4jgio43' });
			const verifySignedNonceSpy = spyOn(EncryptionUtils, 'verifySignedNonce').and.returnValue(verified);
			const req: any = {
				params: { identityId },
				body: { signedNonce: 'SIGNED_NONCE' }
			};

			await authenticationRoutes.proveOwnership(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(identityId);
			expect(getNonceSpy).toHaveBeenCalledWith(identityId);
			expect(verifySignedNonceSpy).toHaveBeenCalledWith(
				'6f9546516cfafef9e544ac7e0092a075b4a253ff4e26c3b53513f8ddc832200a',
				'as23jweoifwefjiasdfoasdfasdasdawd4jgio43',
				'SIGNED_NONCE'
			);
			expect(nextMock).toHaveBeenCalledWith(new Error(`signed nonce is not valid!`));
		});
		
		it('should return the jwt for identity not in db but on tangle', async () => {
			const verified = true;
			const identityId = 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4';
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(null); // not found in db
			const getLatestIdentitySpy = spyOn(ssiService, 'getLatestIdentityJson').and.returnValue(UserIdentityMock.doc);
			const getNonceSpy = spyOn(AuthDb, 'getNonce').and.returnValue({ nonce: 'as23jweoifwefjiasdfoasdfasdasdawd4jgio43' });
			const verifySignedNonceSpy = spyOn(EncryptionUtils, 'verifySignedNonce').and.returnValue(verified);
			const req: any = {
				params: { identityId },
				body: { signedNonce: 'SIGNED_NONCE' }
			};

			await authenticationRoutes.proveOwnership(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(identityId);
			expect(getLatestIdentitySpy).toHaveBeenCalledWith(identityId);
			expect(getNonceSpy).toHaveBeenCalledWith(identityId);
			expect(verifySignedNonceSpy).toHaveBeenCalledWith(
				'6f9546516cfafef9e544ac7e0092a075b4a253ff4e26c3b53513f8ddc832200a',
				'as23jweoifwefjiasdfoasdfasdasdawd4jgio43',
				'SIGNED_NONCE'
			);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalled();
		});

		it('should return the jwt for nonce which is verified=true', async () => {
			const verified = true;
			const userMock: User = validUserMock;
			const identityId = 'did:iota:BfaKRQcBB5G6Kdg7w7HESaVhJfJcQFgg3VSijaWULDwk';
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const getNonceSpy = spyOn(AuthDb, 'getNonce').and.returnValue({ nonce: 'as23jweoifwefjiasdfoasdfasdasdawd4jgio43' });
			const verifySignedNonceSpy = spyOn(EncryptionUtils, 'verifySignedNonce').and.returnValue(verified);
			const req: any = {
				params: { identityId },
				body: { signedNonce: 'SIGNED_NONCE' }
			};

			await authenticationRoutes.proveOwnership(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(identityId);
			expect(getNonceSpy).toHaveBeenCalledWith(identityId);
			expect(verifySignedNonceSpy).toHaveBeenCalledWith(
				'6f9546516cfafef9e544ac7e0092a075b4a253ff4e26c3b53513f8ddc832200a',
				'as23jweoifwefjiasdfoasdfasdasdawd4jgio43',
				'SIGNED_NONCE'
			);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalled();
		});
	});
});
