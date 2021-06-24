import { DeviceIdentityMock, ServerIdentityMock } from '../../../test/mocks/identities';
import * as IdentityDocsDb from '../../../database/identity-docs';
import { SsiService } from '../../../services/ssi-service';
import { UserService } from '../../../services/user-service';
import { VerificationService } from '../../../services/verification-service';
import { Config, IdentityConfig } from '../../../models/config';
import { StatusCodes } from 'http-status-codes';
import { VerificationRoutes } from '../index';
import * as KeyCollectionLinksDB from '../../../database/verifiable-credentials';
import * as UserDb from '../../../database/user';
import { VerifiableCredentialPersistence } from '../../../models/types/key-collection';
import { AuthorizationService } from '../../../services/authorization-service';
import { UserType, UserRoles } from '../../../models/types/user';
import { LoggerMock } from '../../../test/mocks/logger';
import { ConfigMock } from '../../../test/mocks/config';

const vcMock = DeviceIdentityMock.userData.verifiableCredentials[0];

describe('test authentication routes', () => {
	const serverSecret = 'very-secret-secret';
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let userService: UserService;
	let ssiService: SsiService, verificationService: VerificationService, verificationRoutes: VerificationRoutes;
	const SignatureValue = 'SignatureOfTheVc';
	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config: Config = ConfigMock;
		const identityConfig: IdentityConfig = ConfigMock.identityConfig;
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

	describe('test revokeVerifiableCredential route', () => {
		it('should throw an error since no verfiable credential is found to revoke!', async () => {
			const identityToRevoke = vcMock.id;
			// since we won't have a linkedIdentity for it won't go further
			const linkedIdentity: any = null;
			const getVerifiableCredentialSpy = spyOn(KeyCollectionLinksDB, 'getVerifiableCredential').and.returnValue(linkedIdentity);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity');
			const revokeVerifiableCredentialSpy = spyOn(ssiService, 'revokeVerifiableCredential');
			const updateIdentityDocSpy = spyOn(IdentityDocsDb, 'updateIdentityDoc');
			const revokeVerifiableCredentialDbSpy = spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential');
			const req: any = {
				user: { identityId: identityToRevoke },
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).not.toHaveBeenCalled();
			expect(revokeVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(updateIdentityDocSpy).not.toHaveBeenCalled();
			expect(revokeVerifiableCredentialDbSpy).not.toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(new Error('no vc found to revoke the verification!'));
		});

		it('is not authorized to revoke the identity since not same request uid as initiatorId', async () => {
			const identityToRevoke = vcMock.id;
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
			const getVerifiableCredentialSpy = spyOn(KeyCollectionLinksDB, 'getVerifiableCredential').and.returnValue(linkedIdentity);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const revokeVerifiableCredentialSpy = spyOn(ssiService, 'revokeVerifiableCredential').and.returnValue(revokeResult);
			const updateIdentityDocSpy = spyOn(IdentityDocsDb, 'updateIdentityDoc');
			const revokeVerifiableCredentialDbSpy = spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential');
			const req: any = {
				user: { identityId: 'did:iota:4321' }, // different request user id than initiatorId
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).not.toHaveBeenCalled();
			expect(revokeVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(updateIdentityDocSpy).not.toHaveBeenCalled();
			expect(revokeVerifiableCredentialDbSpy).not.toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(new Error('not allowed to revoke credential!'));
		});

		it('is authorized to revoke the identity since same request uid as initiatorId', async () => {
			const identityToRevoke = vcMock.id;
			const removeUserVcSpy = spyOn(UserDb, 'removeUserVC').and.returnValue({ verifiableCredentials: [] }); // no further vc inside user data
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
			const getVerifiableCredentialSpy = spyOn(KeyCollectionLinksDB, 'getVerifiableCredential').and.returnValue(linkedIdentity);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const revokeVerifiableCredentialSpy = spyOn(ssiService, 'revokeVerifiableCredential').and.returnValue(revokeResult);
			const updateIdentityDocSpy = spyOn(IdentityDocsDb, 'updateIdentityDoc');
			const revokeVerifiableCredentialDbSpy = spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential');
			const req: any = {
				user: { identityId: 'did:iota:1234' }, // same request user id as initiatorId
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, keyCollectionIndex, linkedIdentity.index);
			expect(updateIdentityDocSpy).toHaveBeenCalledWith(revokeResult.docUpdate);
			expect(revokeVerifiableCredentialDbSpy).toHaveBeenCalledWith(linkedIdentity, ServerIdentityMock.doc.id);
			expect(removeUserVcSpy).toHaveBeenCalledWith(vcMock);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});

		it('is authorized to revoke the identity since same request uid as subject id', async () => {
			const vcToRevoke = { ...vcMock, id: 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN' };
			const identityToRevoke = vcToRevoke.id;
			const removeUserVcSpy = spyOn(UserDb, 'removeUserVC').and.returnValue({ verifiableCredentials: [] }); // no further vc inside user data
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
			const getVerifiableCredentialSpy = spyOn(KeyCollectionLinksDB, 'getVerifiableCredential').and.returnValue(linkedIdentity);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const revokeVerifiableCredentialSpy = spyOn(ssiService, 'revokeVerifiableCredential').and.returnValue(revokeResult);
			const updateIdentityDocSpy = spyOn(IdentityDocsDb, 'updateIdentityDoc');
			const revokeVerifiableCredentialDbSpy = spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential');
			const req: any = {
				user: { identityId: 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN' }, // same request user id as linkedIdentity / subject id
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, keyCollectionIndex, linkedIdentity.index);
			expect(updateIdentityDocSpy).toHaveBeenCalledWith(revokeResult.docUpdate);
			expect(revokeVerifiableCredentialDbSpy).toHaveBeenCalledWith(linkedIdentity, ServerIdentityMock.doc.id);
			expect(removeUserVcSpy).toHaveBeenCalledWith(vcToRevoke);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});

		it('is authorized to revoke the identity since it is an admin user', async () => {
			const identityToRevoke = vcMock.id;
			const removeUserVcSpy = spyOn(UserDb, 'removeUserVC').and.returnValue({ verifiableCredentials: [] }); // no further vc inside user data
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
			const getVerifiableCredentialSpy = spyOn(KeyCollectionLinksDB, 'getVerifiableCredential').and.returnValue(linkedIdentity);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const revokeVerifiableCredentialSpy = spyOn(ssiService, 'revokeVerifiableCredential').and.returnValue(revokeResult);
			const updateIdentityDocSpy = spyOn(IdentityDocsDb, 'updateIdentityDoc');
			const revokeVerifiableCredentialDbSpy = spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential');
			const req: any = {
				user: { identityId: 'did:iota:11223344', role: UserRoles.Admin }, // user is an admin
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, keyCollectionIndex, linkedIdentity.index);
			expect(updateIdentityDocSpy).toHaveBeenCalledWith(revokeResult.docUpdate);
			expect(revokeVerifiableCredentialDbSpy).toHaveBeenCalledWith(linkedIdentity, ServerIdentityMock.doc.id);
			expect(removeUserVcSpy).toHaveBeenCalledWith(vcMock);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});

		it('is authorized to revoke the identity since it is an admin user but has further valid vcs', async () => {
			const identityToRevoke = vcMock.id;
			const removeUserVcSpy = spyOn(UserDb, 'removeUserVC').and.returnValue({ verifiableCredentials: [vcMock] }); // has another valid vc inside
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
			const getVerifiableCredentialSpy = spyOn(KeyCollectionLinksDB, 'getVerifiableCredential').and.returnValue(linkedIdentity);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const revokeVerifiableCredentialSpy = spyOn(ssiService, 'revokeVerifiableCredential').and.returnValue(revokeResult);
			const updateIdentityDocSpy = spyOn(IdentityDocsDb, 'updateIdentityDoc');
			const revokeVerifiableCredentialDbSpy = spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential');
			const req: any = {
				user: { identityId: 'did:iota:11223344', role: UserRoles.Admin, type: UserType.Person }, // user is an admin
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, keyCollectionIndex, linkedIdentity.index);
			expect(updateIdentityDocSpy).toHaveBeenCalledWith(revokeResult.docUpdate);
			expect(revokeVerifiableCredentialDbSpy).toHaveBeenCalledWith(linkedIdentity, ServerIdentityMock.doc.id);
			expect(removeUserVcSpy).toHaveBeenCalledWith(vcMock);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});

		it('is authorized to revoke the identity since it is an admin user but has further invalid vcs', async () => {
			const identityToRevoke = vcMock.id;
			const removeUserVcSpy = spyOn(UserDb, 'removeUserVC').and.returnValue({ verifiableCredentials: [vcMock] }); // has another valid vc inside
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
			const getVerifiableCredentialSpy = spyOn(KeyCollectionLinksDB, 'getVerifiableCredential').and.returnValue(linkedIdentity);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const revokeVerifiableCredentialSpy = spyOn(ssiService, 'revokeVerifiableCredential').and.returnValue(revokeResult);
			const updateIdentityDocSpy = spyOn(IdentityDocsDb, 'updateIdentityDoc');
			const revokeVerifiableCredentialDbSpy = spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential');
			const req: any = {
				user: { identityId: 'did:iota:11223344', role: UserRoles.Admin, type: UserType.Person }, // user is an admin
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, keyCollectionIndex, linkedIdentity.index);
			expect(updateIdentityDocSpy).toHaveBeenCalledWith(revokeResult.docUpdate);
			expect(revokeVerifiableCredentialDbSpy).toHaveBeenCalledWith(linkedIdentity, ServerIdentityMock.doc.id);
			expect(removeUserVcSpy).toHaveBeenCalledWith(vcMock);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});

		it('is authorized to revoke the identity since it is an org admin user', async () => {
			const identityToRevoke = vcMock.id;
			const removeUserVcSpy = spyOn(UserDb, 'removeUserVC').and.returnValue({ verifiableCredentials: [] }); // no further vc inside user data
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
			const getVerifiableCredentialSpy = spyOn(KeyCollectionLinksDB, 'getVerifiableCredential').and.returnValue(linkedIdentity);
			const revokeVerifiableCredentialSpy = spyOn(ssiService, 'revokeVerifiableCredential').and.returnValue(revokeResult);
			const updateIdentityDocSpy = spyOn(IdentityDocsDb, 'updateIdentityDoc');
			const revokeVerifiableCredentialDbSpy = spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential');
			const req: any = {
				user: { identityId: 'did:iota:11223344', role: UserRoles.Manager, type: UserType.Person }, // user is an org admin
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(revokeVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(updateIdentityDocSpy).not.toHaveBeenCalled();
			expect(revokeVerifiableCredentialDbSpy).not.toHaveBeenCalled();
			expect(removeUserVcSpy).not.toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(new Error('not allowed to revoke credential!'));
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
			const getVerifiableCredentialSpy = spyOn(KeyCollectionLinksDB, 'getVerifiableCredential').and.returnValue(linkedIdentity);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const revokeVerifiableCredentialSpy = spyOn(ssiService, 'revokeVerifiableCredential').and.returnValue(revokeResult);
			const updateIdentityDocSpy = spyOn(IdentityDocsDb, 'updateIdentityDoc');
			const revokeVerifiableCredentialDbSpy = spyOn(KeyCollectionLinksDB, 'revokeVerifiableCredential');
			const req: any = {
				user: { identityId: 'did:iota:1234', type: UserType.Person }, // same request user id as initiatorId
				params: {},
				body: { subjectId: identityToRevoke, signatureValue: SignatureValue }
			};

			await verificationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getVerifiableCredentialSpy).toHaveBeenCalledWith(SignatureValue);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, keyCollectionIndex, linkedIdentity.index);
			expect(updateIdentityDocSpy).toHaveBeenCalledWith(revokeResult.docUpdate);
			expect(revokeVerifiableCredentialDbSpy).not.toHaveBeenCalled();
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});
	});
});
