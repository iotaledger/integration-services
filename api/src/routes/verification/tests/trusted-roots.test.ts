import { ServerIdentityMock } from '../../../test/mocks/identities';
import { SsiService } from '../../../services/ssi-service';
import { UserService } from '../../../services/user-service';
import { VerificationService } from '../../../services/verification-service';
import { IdentityConfig } from '../../../models/config';
import { StatusCodes } from 'http-status-codes';
import * as TrustedRootsDb from '../../../database/trusted-roots';
import { VerificationRoutes } from '../index';
import { AuthorizationService } from '../../../services/authorization-service';
import { UserRoles } from '../../../models/types/user';
import { LoggerMock } from '../../../test/mocks/logger';
import { IdentityConfigMock } from '../../../test/mocks/config';

describe('test authentication routes', () => {
	const serverSecret = 'very-secret-secret';
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
		verificationRoutes = new VerificationRoutes(verificationService, authorizationService, LoggerMock);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	describe('test get trusted root route', () => {
		it('should return trusted roots.', async () => {
			const getTrustedRootIdsSpy = jest
				.spyOn(TrustedRootsDb, 'getTrustedRootIds')
				.mockReturnValue(Promise.resolve([{ identityId: 'did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9' }]));
			const req: any = {
				params: {},
				body: null
			};

			await verificationRoutes.getTrustedRootIdentities(req, res, nextMock);

			expect(getTrustedRootIdsSpy).toHaveBeenCalledWith();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith({ trustedRoots: ['did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9'] });
		});
	});

	describe('test add trusted root route', () => {
		it('should return unauthorized if user is no admin!', async () => {
			const req: any = {
				params: {},
				user: null, // no admin user
				body: { trustedRootId: 'did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9' }
			};

			await verificationRoutes.addTrustedRootIdentity(req, res, nextMock);

			expect(res.send).toHaveBeenCalledWith({ error: 'not authorized!' });
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
		});
		it('should not add trusted root since db throws an error!', async () => {
			const addTrustedRootIdSpy = jest.spyOn(TrustedRootsDb, 'addTrustedRootId').mockImplementation(() => {
				throw new Error('db error');
			});
			const loggerSpy = jest.spyOn(LoggerMock, 'error');
			const req: any = {
				params: {},
				user: {
					role: UserRoles.Admin
				},
				body: { trustedRootId: 'did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9' }
			};

			await verificationRoutes.addTrustedRootIdentity(req, res, nextMock);

			expect(addTrustedRootIdSpy).toHaveBeenCalledWith('did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9');
			expect(loggerSpy).toHaveBeenCalledWith(new Error('db error'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not add the trusted root'));
		});
		it('should add trusted root to the identity!', async () => {
			const addTrustedRootIdSpy = jest
				.spyOn(TrustedRootsDb, 'addTrustedRootId')
				.mockReturnValue(Promise.resolve({ result: { n: 1 } } as any));
			const req: any = {
				params: {},
				user: {
					role: UserRoles.Admin
				},
				body: { trustedRootId: 'did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9' }
			};

			await verificationRoutes.addTrustedRootIdentity(req, res, nextMock);

			expect(addTrustedRootIdSpy).toHaveBeenCalledWith('did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9');
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});
	});

	describe('test delete trusted root route', () => {
		it('should return unauthorized if user is no admin!', async () => {
			const req: any = {
				params: { trustedRootId: 'did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9' },
				user: null, // no admin user
				body: {}
			};

			await verificationRoutes.addTrustedRootIdentity(req, res, nextMock);

			expect(res.send).toHaveBeenCalledWith({ error: 'not authorized!' });
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
		});
		it('should not delete trusted root since db throws an error!', async () => {
			const loggerSpy = jest.spyOn(LoggerMock, 'error');
			const removeTrustedRootIdSpy = jest.spyOn(TrustedRootsDb, 'removeTrustedRootId').mockImplementation(() => {
				throw new Error('db error');
			});
			const req: any = {
				params: { trustedRootId: 'did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9' },
				user: {
					role: UserRoles.Admin
				},
				body: {}
			};

			await verificationRoutes.removeTrustedRootIdentity(req, res, nextMock);

			expect(removeTrustedRootIdSpy).toHaveBeenCalledWith('did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9');
			expect(loggerSpy).toHaveBeenCalledWith(new Error('db error'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not remove the trusted root'));
		});
		it('should delete trusted root!', async () => {
			const removeTrustedRootIdSpy = jest
				.spyOn(TrustedRootsDb, 'removeTrustedRootId')
				.mockReturnValue(Promise.resolve({ result: { n: 1 } } as any));
			const req: any = {
				params: { trustedRootId: 'did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9' },
				user: {
					role: UserRoles.Admin
				},
				body: {}
			};

			await verificationRoutes.removeTrustedRootIdentity(req, res, nextMock);

			expect(removeTrustedRootIdSpy).toHaveBeenCalledWith('did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9');
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});
	});
});
