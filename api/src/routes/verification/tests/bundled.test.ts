import { IdentityConfig } from '../../../models/config';
import { SsiService } from '../../../services/ssi-service';
import { VerificationRoutes } from '../index';
import { VerificationService } from '../../../services/verification-service';
import { UserService } from '../../../services/user-service';
import { StatusCodes } from 'http-status-codes';
import { UserIdentityMock } from '../../../test/mocks/identities';
import { AuthorizationService } from '../../../services/authorization-service';
import { LoggerMock } from '../../../test/mocks/logger';
import { IdentityConfigMock } from '../../../test/mocks/config';
import { ConfigurationServiceMock } from '../../../test/mocks/service-mocks';

describe('test authentication routes', () => {
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

	describe('test getLatestDocument route', () => {
		it('should return bad request if no id for the identity is provided!', async () => {
			const getLatestIdentitySpy = jest.spyOn(ssiService, 'getLatestIdentityJson');
			const req: any = {
				params: {},
				body: null
			};

			await verificationRoutes.getLatestDocument(req, res, nextMock);

			expect(getLatestIdentitySpy).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'no identityId provided' });
		});

		it('should return the document of the id', async () => {
			const id = 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4';
			const getLatestIdentitySpy = jest
				.spyOn(ssiService, 'getLatestIdentityJson')
				.mockReturnValue(Promise.resolve(UserIdentityMock as any));
			const req: any = {
				params: { identityId: id },
				body: null
			};

			await verificationRoutes.getLatestDocument(req, res, nextMock);

			expect(getLatestIdentitySpy).toHaveBeenCalledWith(id);
			expect(res.send).toHaveBeenCalledWith(UserIdentityMock);
		});
	});
});
