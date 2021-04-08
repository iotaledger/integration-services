import { DeviceIdentityMock, ServerIdentityMock } from '../../../test/mocks/identities';
import * as IdentitiesDb from '../../../database/identities';
import { IdentityService } from '../../../services/identity-service';
import { UserService } from '../../../services/user-service';
import { AuthenticationService } from '../../../services/authentication-service';
import { IdentityConfig } from '../../../models/config';
import { StatusCodes } from 'http-status-codes';
import * as TrustedRootsDb from '../../../database/trusted-roots';
import { AuthenticationRoutes } from '../index';
import { AuthorizationService } from '../../../services/authorization-service';

const vcToCheck = DeviceIdentityMock.userData.verifiableCredentials[0];

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
		const authorizationService = new AuthorizationService(userService);
		authenticationService = new AuthenticationService(identityService, userService, {
			jwtExpiration: '2 days',
			serverSecret: 'very-secret-secret',
			serverIdentityId: ServerIdentityMock.doc.id
		});
		authenticationRoutes = new AuthenticationRoutes(authenticationService, userService, authorizationService, config);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	describe('test checkVerifiableCredential route', () => {
		it('should return error since it is no valid vc', async () => {
			const isVerified = true;
			const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(isVerified);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const req: any = {
				params: {},
				body: null // no valid vc!
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).not.toHaveBeenCalled();
			expect(checkVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(new Error('No valid verifiable credential provided!'));
		});

		it('should throw an error since no server identity is found with the id!', async () => {
			const isVerified = true;
			const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(isVerified);
			// no server identity found
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(null);
			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(checkVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(new Error('no valid server identity to check the credential.'));
		});

		it('should throw error since no trusted roots found!', async () => {
			const isVerified = false;
			const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(isVerified);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const getTrustedRootIdsSpy = spyOn(TrustedRootsDb, 'getTrustedRootIds').and.returnValue([]);

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vcToCheck);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(nextMock).toHaveBeenCalledWith(new Error('no trusted roots found!'));
		});

		it('should return false since since root is not trusted', async () => {
			const vcIsVerified = true;
			const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(vcIsVerified);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const getTrustedRootIdsSpy = spyOn(TrustedRootsDb, 'getTrustedRootIds').and.returnValue([{ userId: 'did:iota:123noissuer' }]);

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vcToCheck);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: false });
		});

		it('should return false since it is not verified', async () => {
			const vcIsVerified = false;
			const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(vcIsVerified);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const getTrustedRootIdsSpy = spyOn(TrustedRootsDb, 'getTrustedRootIds').and.returnValue([{ userId: ServerIdentityMock.doc.id }]);

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vcToCheck);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: false });
		});
		it('should return true since vc is verified and root is trusted', async () => {
			const vcIsVerified = true;
			const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(vcIsVerified);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const getTrustedRootIdsSpy = spyOn(TrustedRootsDb, 'getTrustedRootIds').and.returnValue([{ userId: ServerIdentityMock.doc.id }]);

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vcToCheck);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: true });
		});
	});
});
