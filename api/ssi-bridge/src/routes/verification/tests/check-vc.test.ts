import { DeviceIdentityMock, ServerIdentityMock, ServerIdentityKey } from '../../../test/mocks/identities';
import * as IdentityDocsDb from '../../../database/identity-keys';
import { SsiService } from '../../../services/ssi-service';
import { UserService } from '../../../services/user-service';
import { VerificationService } from '../../../services/verification-service';
import { IdentityConfig } from '../../../models/config';
import { StatusCodes } from 'http-status-codes';
import { VerificationRoutes } from '../index';
import { AuthorizationService } from '../../../services/authorization-service';
import { LoggerMock } from '../../../test/mocks/logger';
import { IdentityConfigMock } from '../../../test/mocks/config';
import { ConfigurationServiceMock } from '../../../test/mocks/service-mocks';
import { IdentityKeys } from '@iota/is-shared-modules';

const vcToCheck = DeviceIdentityMock.userData.verifiableCredentials[0];

describe('test authentication routes', () => {
	const serverSecret = ConfigurationServiceMock.config.serverSecret;
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let userService: UserService;
	let ssiService: SsiService, verificationService: VerificationService, verificationRoutes: VerificationRoutes;
	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();

		const identityConfig: IdentityConfig = IdentityConfigMock;
		ssiService = SsiService.getInstance(identityConfig, LoggerMock);
		userService = new UserService({} as any, '', LoggerMock);
		const authorizationService = new AuthorizationService();
		verificationService = new VerificationService(ssiService, userService, LoggerMock, ConfigurationServiceMock);
		verificationRoutes = new VerificationRoutes(verificationService, authorizationService, LoggerMock, ConfigurationServiceMock);

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
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys').mockReturnValue(Promise.resolve(null));
			const req: any = {
				params: {},
				body: vcToCheck
			};

			await verificationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.document.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(loggerSpy).toHaveBeenCalledWith(new Error('no valid server identity to check the credential.'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not check the verifiable credential'));
		});

		it('should return false since root and issuer are not the same', async () => {
			const vcIsVerified = true;
			const checkVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'checkVerifiableCredential')
				.mockReturnValue(Promise.resolve(vcIsVerified));
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys').mockReturnValue(Promise.resolve({id: "did:iota:wrongRoot"} as IdentityKeys));


			const req: any = {
				params: {},
				body: vcToCheck
			};

			await verificationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.document.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vcToCheck);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: false });
		});

		it('should return true since vc is verified and root is trusted', async () => {
			const vcIsVerified = true;
			const checkVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'checkVerifiableCredential')
				.mockReturnValue(Promise.resolve(vcIsVerified));
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys').mockReturnValue(Promise.resolve(ServerIdentityKey));

			const req: any = {
				params: {},
				body: vcToCheck
			};

			await verificationRoutes.checkVerifiableCredential(req, res, nextMock);

			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.document.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vcToCheck);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: true });
		});
	});
});
