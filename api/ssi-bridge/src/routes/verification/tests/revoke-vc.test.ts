import { DeviceIdentityMock, ServerIdentityMock, ServerIdentityKey } from '../../../test/mocks/identities';
import * as IdentityDocsDb from '../../../database/identity-keys';
import { SsiService } from '../../../services/ssi-service';
import { UserService } from '../../../services/user-service';
import { VerificationService } from '../../../services/verification-service';
import { IdentityConfig } from '../../../models/config';
import { StatusCodes } from 'http-status-codes';
import { VerificationRoutes } from '../index';
import * as KeyCollectionLinksDB from '../../../database/verifiable-credentials';
import * as UserDb from '../../../database/user';
import { VerifiableCredentialPersistence, UserType, UserRoles } from '@iota/is-shared-modules';
import { AuthorizationService } from '../../../services/authorization-service';
import { LoggerMock } from '../../../test/mocks/logger';
import { ConfigMock } from '../../../test/mocks/config';
import { ConfigurationServiceMock } from '../../../test/mocks/service-mocks';

const vcMock = DeviceIdentityMock.userData.verifiableCredentials[0];

describe('test authentication routes', () => {
	const serverSecret = ConfigurationServiceMock.config.serverSecret;
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let userService: UserService;
	let ssiService: SsiService, verificationService: VerificationService, verificationRoutes: VerificationRoutes;
	const SignatureValue = 'SignatureOfTheVc';
	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();

		const identityConfig: IdentityConfig = ConfigMock.identityConfig;
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

	describe('test revokeVerifiableCredential route', () => {
		it('should throw an error since no verfiable credential is found to revoke!', async () => {
			const identityToRevoke = vcMock.id;
			// since we won't have a linkedIdentity for it won't go further
			const loggerSpy = jest.spyOn(LoggerMock, 'error');
			const linkedIdentity: any = null;
			const getVerifiableCredentialSpy = jest
				.spyOn(KeyCollectionLinksDB, 'getVerifiableCredential')
				.mockReturnValue(Promise.resolve(linkedIdentity));
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys');
			const revokeVerifiableCredentialSpy = jest.spyOn(ssiService, 'revokeVerifiableCredential');
			const revokeVerifiableCredentialDbSpy = jest
				.spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential')
				.mockImplementation(async () => null);
			const req: any = {
				user: { id: identityToRevoke },
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).not.toHaveBeenCalled();
			expect(revokeVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(revokeVerifiableCredentialDbSpy).not.toHaveBeenCalled();
			expect(loggerSpy).toHaveBeenCalledWith(new Error('no vc found to revoke the verification!'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not revoke the verifiable credential'));
		});

		it('is not authorized to revoke the identity since not same request uid as initiatorId', async () => {
			const identityToRevoke = vcMock.id;
			const loggerSpy = jest.spyOn(LoggerMock, 'error');
			const linkedIdentity: VerifiableCredentialPersistence = {
				index: 0,
				initiatorId: 'did:iota:1234',
				isRevoked: false,
				vc: { ...vcMock }
			};
			const revokeResult = {
				docUpdate: ServerIdentityMock.doc,
				revoked: true
			};
			const getVerifiableCredentialSpy = jest
				.spyOn(KeyCollectionLinksDB, 'getVerifiableCredential')
				.mockReturnValue(Promise.resolve(linkedIdentity));
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys').mockReturnValue(Promise.resolve(ServerIdentityKey));
			const revokeVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'revokeVerifiableCredential')
				.mockReturnValue(Promise.resolve(revokeResult as any));
			const revokeVerifiableCredentialDbSpy = jest
				.spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential')
				.mockImplementation(async () => null);
			const req: any = {
				user: { id: 'did:iota:4321' }, // different request user id than initiatorId
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).not.toHaveBeenCalled();
			expect(revokeVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(revokeVerifiableCredentialDbSpy).not.toHaveBeenCalled();
			expect(loggerSpy).toHaveBeenCalledWith(new Error('not allowed to revoke credential!'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not revoke the verifiable credential'));
		});

		it('is authorized to revoke the identity since same request uid as initiatorId', async () => {
			const identityToRevoke = vcMock.id;
			const removeUserVcSpy = jest.spyOn(UserDb, 'removeUserVC').mockReturnValue(Promise.resolve({ verifiableCredentials: [] } as any)); // no further vc inside user data
			const keyCollectionIndex = 0;
			const linkedIdentity: VerifiableCredentialPersistence = {
				index: 0,
				initiatorId: 'did:iota:1234',
				isRevoked: false,
				vc: { ...vcMock }
			};
			const revokeResult = {
				docUpdate: ServerIdentityMock.doc,
				revoked: true
			};
			const getVerifiableCredentialSpy = jest
				.spyOn(KeyCollectionLinksDB, 'getVerifiableCredential')
				.mockReturnValue(Promise.resolve(linkedIdentity));
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys').mockReturnValue(Promise.resolve(ServerIdentityKey));
			const revokeVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'revokeVerifiableCredential')
				.mockReturnValue(Promise.resolve(revokeResult as any));
			const revokeVerifiableCredentialDbSpy = jest
				.spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential')
				.mockImplementation(async () => null);
			const req: any = {
				user: { id: 'did:iota:1234' }, // same request user id as initiatorId
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityKey.id, serverSecret);
			expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityKey, keyCollectionIndex, linkedIdentity.index);
			expect(revokeVerifiableCredentialDbSpy).toHaveBeenCalledWith(linkedIdentity, ServerIdentityKey.id);
			expect(removeUserVcSpy).toHaveBeenCalledWith(vcMock);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});

		it('is authorized to revoke the identity since same request uid as subject id', async () => {
			const vcToRevoke = { ...vcMock, id: 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN' };
			const identityToRevoke = vcToRevoke.id;
			const removeUserVcSpy = jest.spyOn(UserDb, 'removeUserVC').mockReturnValue(Promise.resolve({ verifiableCredentials: [] } as any)); // no further vc inside user da)ta
			const keyCollectionIndex = 0;
			const linkedIdentity: VerifiableCredentialPersistence = {
				index: 0,
				initiatorId: 'did:iota:1234',
				isRevoked: false,
				vc: vcToRevoke // same id as request uid below
			};
			const revokeResult = {
				docUpdate: ServerIdentityMock.doc,
				revoked: true
			};
			const getVerifiableCredentialSpy = jest
				.spyOn(KeyCollectionLinksDB, 'getVerifiableCredential')
				.mockReturnValue(Promise.resolve(linkedIdentity));
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys').mockReturnValue(Promise.resolve(ServerIdentityKey));
			const revokeVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'revokeVerifiableCredential')
				.mockReturnValue(Promise.resolve(revokeResult as any));
			const revokeVerifiableCredentialDbSpy = jest
				.spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential')
				.mockImplementation(async () => null);
			const req: any = {
				user: { id: 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN' }, // same request user id as linkedIdentity / subject id
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityKey.id, serverSecret);
			expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityKey, keyCollectionIndex, linkedIdentity.index);
			expect(revokeVerifiableCredentialDbSpy).toHaveBeenCalledWith(linkedIdentity, ServerIdentityKey.id);
			expect(removeUserVcSpy).toHaveBeenCalledWith(vcToRevoke);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});

		it('is authorized to revoke the identity since it is an admin user', async () => {
			const identityToRevoke = vcMock.id;
			const removeUserVcSpy = jest.spyOn(UserDb, 'removeUserVC').mockReturnValue(Promise.resolve({ verifiableCredentials: [] } as any)); // no further vc inside user data
			const keyCollectionIndex = 0;
			const linkedIdentity: VerifiableCredentialPersistence = {
				index: 0,
				initiatorId: 'did:iota:1234',
				isRevoked: false,
				vc: { ...vcMock }
			};
			const revokeResult = {
				docUpdate: ServerIdentityMock.doc,
				revoked: true
			};
			const getVerifiableCredentialSpy = jest
				.spyOn(KeyCollectionLinksDB, 'getVerifiableCredential')
				.mockReturnValue(Promise.resolve(linkedIdentity));
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys').mockReturnValue(Promise.resolve(ServerIdentityKey));
			const revokeVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'revokeVerifiableCredential')
				.mockReturnValue(Promise.resolve(revokeResult as any));
			const revokeVerifiableCredentialDbSpy = jest
				.spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential')
				.mockImplementation(async () => null);
			const req: any = {
				user: { id: 'did:iota:11223344', role: UserRoles.Admin }, // user is an admin
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityKey.id, serverSecret);
			expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityKey, keyCollectionIndex, linkedIdentity.index);
			expect(revokeVerifiableCredentialDbSpy).toHaveBeenCalledWith(linkedIdentity, ServerIdentityKey.id);
			expect(removeUserVcSpy).toHaveBeenCalledWith(vcMock);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});

		it('is authorized to revoke the identity since it is an admin user but has further valid vcs', async () => {
			const identityToRevoke = vcMock.id;
			const removeUserVcSpy = jest
				.spyOn(UserDb, 'removeUserVC')
				.mockReturnValue(Promise.resolve({ verifiableCredentials: [vcMock] } as any)); // has another valid vc inside
			const keyCollectionIndex = 0;
			const linkedIdentity: VerifiableCredentialPersistence = {
				index: 0,
				initiatorId: 'did:iota:1234',
				isRevoked: false,
				vc: { ...vcMock }
			};
			const revokeResult = {
				docUpdate: ServerIdentityMock.doc,
				revoked: true
			};
			const getVerifiableCredentialSpy = jest
				.spyOn(KeyCollectionLinksDB, 'getVerifiableCredential')
				.mockReturnValue(Promise.resolve(linkedIdentity));
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys').mockReturnValue(Promise.resolve(ServerIdentityKey));
			const revokeVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'revokeVerifiableCredential')
				.mockReturnValue(Promise.resolve(revokeResult as any));
			const revokeVerifiableCredentialDbSpy = jest
				.spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential')
				.mockImplementation(async () => null);
			const req: any = {
				user: { id: 'did:iota:11223344', role: UserRoles.Admin, type: UserType.Person }, // user is an admin
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityKey.id, serverSecret);
			expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityKey, keyCollectionIndex, linkedIdentity.index);
			expect(revokeVerifiableCredentialDbSpy).toHaveBeenCalledWith(linkedIdentity, ServerIdentityKey.id);
			expect(removeUserVcSpy).toHaveBeenCalledWith(vcMock);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});

		it('is authorized to revoke the identity since it is an admin user but has further invalid vcs', async () => {
			const identityToRevoke = vcMock.id;
			const removeUserVcSpy = jest
				.spyOn(UserDb, 'removeUserVC')
				.mockReturnValue(Promise.resolve({ verifiableCredentials: [vcMock] } as any)); // has another valid vc inside
			const keyCollectionIndex = 0;
			const linkedIdentity: VerifiableCredentialPersistence = {
				index: 0,
				initiatorId: 'did:iota:1234',
				isRevoked: false,
				vc: vcMock
			};
			const revokeResult = {
				docUpdate: ServerIdentityMock.doc,
				revoked: true
			};
			const getVerifiableCredentialSpy = jest
				.spyOn(KeyCollectionLinksDB, 'getVerifiableCredential')
				.mockReturnValue(Promise.resolve(linkedIdentity));
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys').mockReturnValue(Promise.resolve(ServerIdentityKey));
			const revokeVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'revokeVerifiableCredential')
				.mockReturnValue(Promise.resolve(revokeResult as any));
			const revokeVerifiableCredentialDbSpy = jest
				.spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential')
				.mockImplementation(async () => null);
			const req: any = {
				user: { id: 'did:iota:11223344', role: UserRoles.Admin, type: UserType.Person }, // user is an admin
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityKey.id, serverSecret);
			expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityKey, keyCollectionIndex, linkedIdentity.index);
			expect(revokeVerifiableCredentialDbSpy).toHaveBeenCalledWith(linkedIdentity, ServerIdentityKey.id);
			expect(removeUserVcSpy).toHaveBeenCalledWith(vcMock);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});

		it('is authorized to revoke the identity since it is an org admin user', async () => {
			const identityToRevoke = vcMock.id;
			const loggerSpy = jest.spyOn(LoggerMock, 'error');
			const removeUserVcSpy = jest.spyOn(UserDb, 'removeUserVC').mockReturnValue(Promise.resolve({ verifiableCredentials: [] } as any)); // no further vc inside user data
			const linkedIdentity: VerifiableCredentialPersistence = {
				index: 0,
				initiatorId: 'did:iota:1234',
				isRevoked: false,
				vc: { ...vcMock }
			};
			const revokeResult = {
				docUpdate: ServerIdentityMock.doc,
				revoked: true
			};
			const getVerifiableCredentialSpy = jest
				.spyOn(KeyCollectionLinksDB, 'getVerifiableCredential')
				.mockReturnValue(Promise.resolve(linkedIdentity));
			const revokeVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'revokeVerifiableCredential')
				.mockReturnValue(Promise.resolve(revokeResult as any));
			const revokeVerifiableCredentialDbSpy = jest
				.spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential')
				.mockImplementation(async () => null);
			const req: any = {
				user: { id: 'did:iota:11223344', role: UserRoles.Manager, type: UserType.Person }, // user is an org admin
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(revokeVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(revokeVerifiableCredentialDbSpy).not.toHaveBeenCalled();
			expect(removeUserVcSpy).not.toHaveBeenCalled();
			expect(loggerSpy).toHaveBeenCalledWith(new Error('not allowed to revoke credential!'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not revoke the verifiable credential'));
		});

		it('identity is already revoked', async () => {
			const identityToRevoke = vcMock.id;
			const keyCollectionIndex = 0;
			const linkedIdentity: VerifiableCredentialPersistence = {
				index: 0,
				initiatorId: 'did:iota:1234',
				isRevoked: false,
				vc: { ...vcMock }
			};
			const revokeResult = {
				docUpdate: ServerIdentityMock.doc,
				revoked: false
			};
			const getVerifiableCredentialSpy = jest
				.spyOn(KeyCollectionLinksDB, 'getVerifiableCredential')
				.mockReturnValue(Promise.resolve(linkedIdentity));
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys').mockReturnValue(Promise.resolve(ServerIdentityKey));
			const revokeVerifiableCredentialSpy = jest
				.spyOn(ssiService, 'revokeVerifiableCredential')
				.mockReturnValue(Promise.resolve(revokeResult as any));
			const revokeVerifiableCredentialDbSpy = jest
				.spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential')
				.mockImplementation(async () => null);
			const req: any = {
				user: { id: 'did:iota:1234', type: UserType.Person }, // same request user id as initiatorId
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityKey.id, serverSecret);
			expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityKey, keyCollectionIndex, linkedIdentity.index);
			expect(revokeVerifiableCredentialDbSpy).not.toHaveBeenCalled();
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});
	});
	afterEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
	});
});
