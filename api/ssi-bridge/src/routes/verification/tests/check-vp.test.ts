import { TestVerifiablePresentationMock } from '../../../test/mocks/identities';
import { SsiService } from '../../../services/ssi-service';
import { UserService } from '../../../services/user-service';
import { VerificationService } from '../../../services/verification-service';
import { IdentityConfig } from '../../../models/config';
import * as TrustedRootsDb from '../../../database/trusted-roots';
import { VerificationRoutes } from '../index';
import { AuthorizationService } from '../../../services/authorization-service';
import { LoggerMock } from '../../../test/mocks/logger';
import { IdentityConfigMock } from '../../../test/mocks/config';
import { ConfigurationServiceMock } from '../../../test/mocks/service-mocks';
import { StatusCodes } from 'http-status-codes';

const vp = TestVerifiablePresentationMock;

describe('test verification routes', () => {
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

	describe('test checkVerifiablePresentation route', () => {
		it('should throw an error since no trusted roots found!', async () => {
			const isVerified = true;
			const loggerSpy = jest.spyOn(LoggerMock, 'error');
			const getTrustedRootIdsSpy = jest.spyOn(TrustedRootsDb, 'getTrustedRootIds').mockReturnValue(Promise.resolve([]));
			const checkVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'checkVerifiablePresentation')
				.mockReturnValue(Promise.resolve(isVerified));
			const req: any = {
				params: {},
				body: vp
			};

			await verificationRoutes.checkVerifiablePresentation(req, res, nextMock);

			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vp, 60);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(loggerSpy).toHaveBeenCalledWith(new Error('no trusted roots found!'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not check the verifiable presentation'));
		});
		it('should throw an error since no expiration set!', async () => {
			const isVerified = true;
			const getTrustedRootIdsSpy = jest.spyOn(TrustedRootsDb, 'getTrustedRootIds').mockReturnValue(Promise.resolve([]));
			const checkVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'checkVerifiablePresentation')
				.mockReturnValue(Promise.resolve(isVerified));
			const req: any = {
				params: {},
				body: {
					...vp,
					proof: {
						...vp.proof,
						expires: undefined
					}
				}
			};

			await verificationRoutes.checkVerifiablePresentation(req, res, nextMock);

			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vp, 60);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'Verifiable Presentation must have an expiration!' });
		});

		it('should return false since issuer is not trusted!', async () => {
			const isVerified = true;
			const getTrustedRootIdsSpy = jest
				.spyOn(TrustedRootsDb, 'getTrustedRootIds')
				.mockReturnValue(Promise.resolve([{ id: 'did:iota:123' }]));
			const checkVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'checkVerifiablePresentation')
				.mockReturnValue(Promise.resolve(isVerified));
			const req: any = {
				params: {},
				body: {
					...vp
				}
			};

			await verificationRoutes.checkVerifiablePresentation(req, res, nextMock);

			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vp, 60);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: false });
		});

		it('should return isVerified true!', async () => {
			const isVerified = true;
			const getTrustedRootIdsSpy = jest
				.spyOn(TrustedRootsDb, 'getTrustedRootIds')
				.mockReturnValue(Promise.resolve([{ id: vp.verifiableCredential.issuer }]));
			const checkVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'checkVerifiablePresentation')
				.mockReturnValue(Promise.resolve(isVerified));
			const req: any = {
				params: {},
				body: {
					...vp
				}
			};

			await verificationRoutes.checkVerifiablePresentation(req, res, nextMock);

			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(vp, 60);
			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ isVerified: true });
		});
	});
});
