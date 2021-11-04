import { DeviceIdentityMock, ServerIdentityMock } from '../../../test/mocks/identities';
import * as IdentityDocsDb from '../../../database/identity-docs';
import { SsiService } from '../../../services/ssi-service';
import { UserService } from '../../../services/user-service';
import { VerificationService } from '../../../services/verification-service';
import { IdentityConfig } from '../../../models/config';
import { StatusCodes } from 'http-status-codes';
import * as TrustedRootsDb from '../../../database/trusted-roots';
import { VerificationRoutes } from '../index';
import { AuthorizationService } from '../../../services/authorization-service';
import { LoggerMock } from '../../../test/mocks/logger';
import { IdentityConfigMock } from '../../../test/mocks/config';

const vcToCheck = DeviceIdentityMock.userData.verifiableCredentials[0];

describe('test authentication routes', () => {
	const serverSecret = 'very-secret-secret';
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let userService: UserService;
	let ssiService: SsiService, verificationService: VerificationService, verificationRoutes: VerificationRoutes;
	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config: any = {
			serverIdentityId: ServerIdentityMock.doc.id
		};
		const identityConfig: IdentityConfig = IdentityConfigMock;
		ssiService = SsiService.getInstance(identityConfig, LoggerMock);
		userService = new UserService({} as any, '', LoggerMock);
		const authorizationService = new AuthorizationService();
		verificationService = new VerificationService(
			ssiService,
			userService,
			{
				serverSecret,
				serverIdentityId: ServerIdentityMock.doc.id,
				keyCollectionSize: 2
			},
			LoggerMock
		);
		verificationRoutes = new VerificationRoutes(verificationService, authorizationService, config, LoggerMock);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	describe('test checkVerifiableCredential route', () => {
		it('should throw an error since no server identity is found with the id!', async () => {
			const isVerified = true;
			const loggerSpy = jest.spyOn(LoggerMock, 'error');
			const checkVerifiableCredentialSpy = jest.spyOn(ssiService, 'checkVerifiableCredential').mockReturnValue(Promise.resolve(isVerified));
			// no server identity found
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentity').mockReturnValue(Promise.resolve(null));
			const req: any = {
				params: {},
				body: vcToCheck
			};

			await verificationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(loggerSpy).toHaveBeenCalledWith(new Error('no valid server identity to check the credential.'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not check the verifiable credential'));
		});

		it('should throw error since no trusted roots found!', async () => {
			const isVerified = false;
			const checkVerifiableCredentialSpy = jest.spyOn(ssiService, 'checkVerifiableCredential').mockReturnValue(Promise.resolve(isVerified));
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentity').mockReturnValue(Promise.resolve(ServerIdentityMock));
			const getTrustedRootIdsSpy = jest.spyOn(TrustedRootsDb, 'getTrustedRootIds').mockReturnValue(Promise.resolve([]));
			const loggerSpy = jest.spyOn(LoggerMock, 'error');

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await verificationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vcToCheck);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(loggerSpy).toHaveBeenCalledWith(new Error('no trusted roots found!'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not check the verifiable credential'));
		});

		it('should return false since since root is not trusted', async () => {
			const vcIsVerified = true;
			const checkVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'checkVerifiableCredential')
				.mockReturnValue(Promise.resolve(vcIsVerified));
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentity').mockReturnValue(Promise.resolve(ServerIdentityMock));
			const getTrustedRootIdsSpy = jest
				.spyOn(TrustedRootsDb, 'getTrustedRootIds')
				.mockReturnValue(Promise.resolve([{ identityId: 'did:iota:123noissuer' }]));

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await verificationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vcToCheck);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: false });
		});

		it('should return false since it is not verified', async () => {
			const vcIsVerified = false;
			const checkVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'checkVerifiableCredential')
				.mockReturnValue(Promise.resolve(vcIsVerified));
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentity').mockReturnValue(Promise.resolve(ServerIdentityMock));
			const getTrustedRootIdsSpy = jest
				.spyOn(TrustedRootsDb, 'getTrustedRootIds')
				.mockReturnValue(Promise.resolve([{ identityId: ServerIdentityMock.doc.id }]));

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await verificationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vcToCheck);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: false });
		});
		it('should return true since vc is verified and root is trusted', async () => {
			const vcIsVerified = true;
			const checkVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'checkVerifiableCredential')
				.mockReturnValue(Promise.resolve(vcIsVerified));
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentity').mockReturnValue(Promise.resolve(ServerIdentityMock));
			const getTrustedRootIdsSpy = jest
				.spyOn(TrustedRootsDb, 'getTrustedRootIds')
				.mockReturnValue(Promise.resolve([{ identityId: ServerIdentityMock.doc.id }]));

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await verificationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vcToCheck);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: true });
		});
	});
});
