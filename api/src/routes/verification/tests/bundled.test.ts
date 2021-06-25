import { IdentityConfig } from '../../../models/config';
import { SsiService } from '../../../services/ssi-service';
import { VerificationRoutes } from '../index';
import { VerificationService } from '../../../services/verification-service';
import { UserService } from '../../../services/user-service';
import { StatusCodes } from 'http-status-codes';
import { ServerIdentityMock, UserIdentityMock } from '../../../test/mocks/identities';
import { AuthorizationService } from '../../../services/authorization-service';
import { LoggerMock } from '../../../test/mocks/logger';

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
		const identityConfig: IdentityConfig = {
			keyCollectionTag: 'key-collection',
			explorer: '',
			network: 'test',
			node: '',
			keyType: 0,
			hashFunction: 0,
			hashEncoding: 'base58'
		};
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

	describe('test getLatestDocument route', () => {
		it('should return bad request if no id for the identity is provided!', async () => {
			const getLatestIdentitySpy = spyOn(ssiService, 'getLatestIdentityJson');
			const req: any = {
				params: {},
				body: null
			};

			await verificationRoutes.getLatestDocument(req, res, nextMock);

			expect(getLatestIdentitySpy).not.toHaveBeenCalled();
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		});

		it('should return the document of the id', async () => {
			const id = 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4';
			const getLatestIdentitySpy = spyOn(ssiService, 'getLatestIdentityJson').and.returnValue(UserIdentityMock);
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
