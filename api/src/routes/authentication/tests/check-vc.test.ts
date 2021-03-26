import { DeviceIdentityMock, ServerIdentityMock } from '../../../test/mocks/identities';
import * as IdentitiesDb from '../../../database/identities';
import { IdentityService } from '../../../services/identity-service';
import { UserService } from '../../../services/user-service';
import { AuthenticationService } from '../../../services/authentication-service';
import { IdentityConfig } from '../../../models/config';
import { StatusCodes } from 'http-status-codes';
import * as TrustedRootsDb from '../../../database/trusted-roots';
import { AuthenticationRoutes } from '../index';

const vcToCheck = DeviceIdentityMock.userData.verifiableCredentials[0];
const userMock = DeviceIdentityMock.userData;

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
		authenticationService = new AuthenticationService(identityService, userService, 'very-secret-secret', '2 days');
		authenticationRoutes = new AuthenticationRoutes(authenticationService, userService, config);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	describe('test checkVerifiableCredential route', () => {
		let updateUserVerificationSpy: any;
		beforeEach(() => {
			updateUserVerificationSpy = spyOn(userService, 'updateUserVerification');
		});

		it('should return error since it is no valid vc', async () => {
			const isVerified = true;
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(isVerified);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const req: any = {
				params: {},
				body: null // no valid vc!
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).not.toHaveBeenCalled();
			expect(checkVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(getUserSpy).not.toHaveBeenCalled();
			expect(updateUserVerificationSpy).not.toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(new Error('No valid verifiable credential provided!'));
		});

		it('should throw an error since no issuer is found with the id!', async () => {
			const isVerified = true;
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(isVerified);
			// no issuer found
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(null);
			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(checkVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(getUserSpy).not.toHaveBeenCalled();
			expect(updateUserVerificationSpy).not.toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(new Error(`No identiity found for issuerId: ${ServerIdentityMock.doc.id}`));
		});

		it('should throw error since no trusted roots found!', async () => {
			const isVerified = false;
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(isVerified);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const getTrustedRootIdsSpy = spyOn(TrustedRootsDb, 'getTrustedRootIds').and.returnValue([]);

			// TrustedRootsDb.getTrustedRootIds
			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, vcToCheck);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(getUserSpy).not.toHaveBeenCalledWith();
			expect(nextMock).toHaveBeenCalledWith(new Error('no trusted roots found!'));
		});

		it('should return false since since root is not trusted', async () => {
			const vcIsVerified = true;
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(vcIsVerified);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const getTrustedRootIdsSpy = spyOn(TrustedRootsDb, 'getTrustedRootIds').and.returnValue([{ userId: 'did:iota:123noissuer' }]);

			// TrustedRootsDb.getTrustedRootIds
			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, vcToCheck);
			expect(getUserSpy).toHaveBeenCalledWith(userMock.userId);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(updateUserVerificationSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					verified: false
				})
			);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: false });
		});

		it('should return false since it is not verified', async () => {
			const vcIsVerified = false;
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(vcIsVerified);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const getTrustedRootIdsSpy = spyOn(TrustedRootsDb, 'getTrustedRootIds').and.returnValue([{ userId: ServerIdentityMock.doc.id }]);

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, vcToCheck);
			expect(getUserSpy).toHaveBeenCalledWith(userMock.userId);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(updateUserVerificationSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					verified: false
				})
			);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: false });
		});
		it('should return true since vc is verified and root is trusted', async () => {
			const vcIsVerified = true;
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(userMock);
			const checkVerifiableCredentialSpy = spyOn(identityService, 'checkVerifiableCredential').and.returnValue(vcIsVerified);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const getTrustedRootIdsSpy = spyOn(TrustedRootsDb, 'getTrustedRootIds').and.returnValue([{ userId: ServerIdentityMock.doc.id }]);

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, vcToCheck);
			expect(getUserSpy).toHaveBeenCalledWith(userMock.userId);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(updateUserVerificationSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					verified: true
				})
			);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: true });
		});
	});
});
