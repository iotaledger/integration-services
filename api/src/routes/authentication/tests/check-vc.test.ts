import { DeviceIdentityMock, ServerIdentityMock } from '../../../test/mocks/identities';
import * as IdentityDocsDb from '../../../database/identity-docs';
import { SsiService } from '../../../services/ssi-service';
import { IdentityService } from '../../../services/identity-service';
import { AuthenticationService } from '../../../services/authentication-service';
import { IdentityConfig } from '../../../models/config';
import { StatusCodes } from 'http-status-codes';
import * as TrustedRootsDb from '../../../database/trusted-roots';
import { AuthenticationRoutes } from '../index';
import { AuthorizationService } from '../../../services/authorization-service';

const vcToCheck = DeviceIdentityMock.userData.verifiableCredentials[0];

describe('test authentication routes', () => {
	const serverSecret = 'very-secret-secret';
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let identityService: IdentityService;
	let ssiService: SsiService, authenticationService: AuthenticationService, authenticationRoutes: AuthenticationRoutes;
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
		ssiService = SsiService.getInstance(identityConfig);
		identityService = new IdentityService();
		const authorizationService = new AuthorizationService(identityService);
		authenticationService = new AuthenticationService(ssiService, identityService, {
			jwtExpiration: '2 days',
			serverSecret,
			serverIdentityId: ServerIdentityMock.doc.id
		});
		authenticationRoutes = new AuthenticationRoutes(authenticationService, identityService, authorizationService, config);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	describe('test checkVerifiableCredential route', () => {
		it('should throw an error since no server identity is found with the id!', async () => {
			const isVerified = true;
			const checkVerifiableCredentialSpy = spyOn(ssiService, 'checkVerifiableCredential').and.returnValue(isVerified);
			// no server identity found
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(null);
			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(new Error('no valid server identity to check the credential.'));
		});

		it('should throw error since no trusted roots found!', async () => {
			const isVerified = false;
			const checkVerifiableCredentialSpy = spyOn(ssiService, 'checkVerifiableCredential').and.returnValue(isVerified);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const getTrustedRootIdsSpy = spyOn(TrustedRootsDb, 'getTrustedRootIds').and.returnValue([]);

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vcToCheck);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(nextMock).toHaveBeenCalledWith(new Error('no trusted roots found!'));
		});

		it('should return false since since root is not trusted', async () => {
			const vcIsVerified = true;
			const checkVerifiableCredentialSpy = spyOn(ssiService, 'checkVerifiableCredential').and.returnValue(vcIsVerified);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const getTrustedRootIdsSpy = spyOn(TrustedRootsDb, 'getTrustedRootIds').and.returnValue([{ userId: 'did:iota:123noissuer' }]);

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vcToCheck);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: false });
		});

		it('should return false since it is not verified', async () => {
			const vcIsVerified = false;
			const checkVerifiableCredentialSpy = spyOn(ssiService, 'checkVerifiableCredential').and.returnValue(vcIsVerified);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const getTrustedRootIdsSpy = spyOn(TrustedRootsDb, 'getTrustedRootIds').and.returnValue([{ userId: ServerIdentityMock.doc.id }]);

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vcToCheck);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: false });
		});
		it('should return true since vc is verified and root is trusted', async () => {
			const vcIsVerified = true;
			const checkVerifiableCredentialSpy = spyOn(ssiService, 'checkVerifiableCredential').and.returnValue(vcIsVerified);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const getTrustedRootIdsSpy = spyOn(TrustedRootsDb, 'getTrustedRootIds').and.returnValue([{ userId: ServerIdentityMock.doc.id }]);

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await authenticationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vcToCheck);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: true });
		});
	});
});
