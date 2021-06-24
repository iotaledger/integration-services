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

	describe('test get trusted root route', () => {
		it('should return trusted roots.', async () => {
			const getTrustedRootIdsSpy = spyOn(TrustedRootsDb, 'getTrustedRootIds').and.returnValue([
				{ identityId: 'did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9' }
			]);
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
				body: { trustedRoot: 'did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9' }
			};

			await verificationRoutes.addTrustedRootIdentity(req, res, nextMock);

			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
		});
		it('should not add trusted root since db throws an error!', async () => {
			const addTrustedRootIdSpy = spyOn(TrustedRootsDb, 'addTrustedRootId').and.throwError('db error');
			const loggerSpy = spyOn(LoggerMock, 'error');
			const req: any = {
				params: {},
				user: {
					role: UserRoles.Admin
				},
				body: { trustedRoot: 'did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9' }
			};

			await verificationRoutes.addTrustedRootIdentity(req, res, nextMock);

			expect(addTrustedRootIdSpy).toHaveBeenCalledWith('did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9');
			expect(loggerSpy).toHaveBeenCalledWith(new Error('db error'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not add the trusted root'));
		});
		it('should add trusted root to the identity!', async () => {
			const addTrustedRootIdSpy = spyOn(TrustedRootsDb, 'addTrustedRootId').and.returnValue({ result: { n: 1 } });
			const req: any = {
				params: {},
				user: {
					role: UserRoles.Admin
				},
				body: { trustedRoot: 'did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9' }
			};

			await verificationRoutes.addTrustedRootIdentity(req, res, nextMock);

			expect(addTrustedRootIdSpy).toHaveBeenCalledWith('did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9');
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});
	});

	describe('test delete trusted root route', () => {
		it('should return unauthorized if user is no admin!', async () => {
			const req: any = {
				params: {},
				user: null, // no admin user
				body: { trustedRoot: 'did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9' }
			};

			await verificationRoutes.addTrustedRootIdentity(req, res, nextMock);

			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
		});
		it('should not delete trusted root since db throws an error!', async () => {
			const loggerSpy = spyOn(LoggerMock, 'error');
			const removeTrustedRootIdSpy = spyOn(TrustedRootsDb, 'removeTrustedRootId').and.throwError('db error');
			const req: any = {
				params: {},
				user: {
					role: UserRoles.Admin
				},
				body: { trustedRoot: 'did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9' }
			};

			await verificationRoutes.removeTrustedRootIdentity(req, res, nextMock);

			expect(removeTrustedRootIdSpy).toHaveBeenCalledWith('did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9');
			expect(loggerSpy).toHaveBeenCalledWith(new Error('db error'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not remove the trusted root'));
		});
		it('should delete trusted root!', async () => {
			const removeTrustedRootIdSpy = spyOn(TrustedRootsDb, 'removeTrustedRootId').and.returnValue({ result: { n: 1 } });
			const req: any = {
				params: {},
				user: {
					role: UserRoles.Admin
				},
				body: { trustedRoot: 'did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9' }
			};

			await verificationRoutes.removeTrustedRootIdentity(req, res, nextMock);

			expect(removeTrustedRootIdSpy).toHaveBeenCalledWith('did:iota:7boYqeGX34Kpukr84N2wwaKcJLkMwiZDCXbTpggxnec9');
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});
	});
});
