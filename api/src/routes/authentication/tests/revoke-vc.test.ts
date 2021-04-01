import { DeviceIdentityMock, ServerIdentityMock } from '../../../test/mocks/identities';
import * as IdentitiesDb from '../../../database/identities';
import { IdentityService } from '../../../services/identity-service';
import { UserService } from '../../../services/user-service';
import { AuthenticationService } from '../../../services/authentication-service';
import { IdentityConfig } from '../../../models/config';
import { StatusCodes } from 'http-status-codes';
import { AuthenticationRoutes } from '../index';
import * as KeyCollectionLinksDB from '../../../database/key-collection-links';
import { LinkedKeyCollectionIdentityPersistence } from '../../../models/types/key-collection';

const vcMock = DeviceIdentityMock.userData.verifiableCredentials[0];

describe('test authentication routes', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let userService: UserService;
	let identityService: IdentityService, authenticationService: AuthenticationService, authenticationRoutes: AuthenticationRoutes;
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
		identityService = IdentityService.getInstance(identityConfig);
		userService = new UserService();
		authenticationService = new AuthenticationService(identityService, userService, {
			jwtExpiration: '2 days',
			serverSecret: 'very-secret-secret',
			serverIdentityId: ServerIdentityMock.doc.id
		});
		authenticationRoutes = new AuthenticationRoutes(authenticationService, userService, config);

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
			const getLinkedKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'getLinkedKeyCollectionIdentity').and.returnValue(linkedIdentity);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity');
			const revokeVerifiableCredentialSpy = spyOn(identityService, 'revokeVerifiableCredential');
			const updateIdentityDocSpy = spyOn(IdentitiesDb, 'updateIdentityDoc');
			const revokeKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'revokeKeyCollectionIdentity');
			const updateUserVerificationSpy = spyOn(userService, 'updateUserVerification');
			const req: any = {
				user: { userId: identityToRevoke },
				params: {},
				body: { subjectId: identityToRevoke }
			};

			await authenticationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getLinkedKeyCollectionIdentitySpy).toHaveBeenCalledWith(identityToRevoke);
			expect(getIdentitySpy).not.toHaveBeenCalled();
			expect(revokeVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(updateIdentityDocSpy).not.toHaveBeenCalled();
			expect(revokeKeyCollectionIdentitySpy).not.toHaveBeenCalled();
			expect(updateUserVerificationSpy).not.toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(new Error('no identity found to revoke the verification!'));
		});

		it('is not authorized to revoke the identity since not same request uid as initiatorId', async () => {
			const identityToRevoke = vcMock.id;
			const linkedIdentity: LinkedKeyCollectionIdentityPersistence = {
				keyCollectionIndex: 0,
				index: 0,
				initiatorId: 'did:iota:1234',
				linkedIdentity: 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN',
				isRevoked: false,
				revokedIdentity: undefined
			};
			const revokeResult = {
				docUpdate: ServerIdentityMock.doc,
				revoked: true
			};
			const getLinkedKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'getLinkedKeyCollectionIdentity').and.returnValue(linkedIdentity);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const revokeVerifiableCredentialSpy = spyOn(identityService, 'revokeVerifiableCredential').and.returnValue(revokeResult);
			const updateIdentityDocSpy = spyOn(IdentitiesDb, 'updateIdentityDoc');
			const revokeKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'revokeKeyCollectionIdentity');
			const updateUserVerificationSpy = spyOn(userService, 'updateUserVerification');
			const req: any = {
				user: { userId: 'did:iota:4321' }, // different request user id than initiatorId
				params: {},
				body: { subjectId: identityToRevoke }
			};

			await authenticationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getLinkedKeyCollectionIdentitySpy).toHaveBeenCalledWith(identityToRevoke);
			expect(getIdentitySpy).not.toHaveBeenCalled();
			expect(revokeVerifiableCredentialSpy).not.toHaveBeenCalled();
			expect(updateIdentityDocSpy).not.toHaveBeenCalled();
			expect(revokeKeyCollectionIdentitySpy).not.toHaveBeenCalled();
			expect(updateUserVerificationSpy).not.toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(new Error('not allowed to revoke credential!'));
		});

		it('is authorized to revoke the identity since same request uid as initiatorId', async () => {
			const identityToRevoke = vcMock.id;
			const linkedIdentity: LinkedKeyCollectionIdentityPersistence = {
				keyCollectionIndex: 0,
				index: 0,
				initiatorId: 'did:iota:1234',
				linkedIdentity: 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN',
				isRevoked: false,
				revokedIdentity: undefined
			};
			const revokeResult = {
				docUpdate: ServerIdentityMock.doc,
				revoked: true
			};
			const getLinkedKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'getLinkedKeyCollectionIdentity').and.returnValue(linkedIdentity);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const revokeVerifiableCredentialSpy = spyOn(identityService, 'revokeVerifiableCredential').and.returnValue(revokeResult);
			const updateIdentityDocSpy = spyOn(IdentitiesDb, 'updateIdentityDoc');
			const revokeKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'revokeKeyCollectionIdentity');
			const updateUserVerificationSpy = spyOn(userService, 'updateUserVerification');
			const req: any = {
				user: { userId: 'did:iota:1234' }, // same request user id as initiatorId
				params: {},
				body: { subjectId: identityToRevoke }
			};

			await authenticationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getLinkedKeyCollectionIdentitySpy).toHaveBeenCalledWith(identityToRevoke);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, linkedIdentity.index);
			expect(updateIdentityDocSpy).toHaveBeenCalledWith(revokeResult.docUpdate);
			expect(revokeKeyCollectionIdentitySpy).toHaveBeenCalledWith(linkedIdentity);
			expect(updateUserVerificationSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					verified: false
				})
			);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});

		it('identity is already revoked', async () => {
			const identityToRevoke = vcMock.id;
			const linkedIdentity: LinkedKeyCollectionIdentityPersistence = {
				keyCollectionIndex: 0,
				index: 0,
				initiatorId: 'did:iota:1234',
				linkedIdentity: 'did:iota:CkPB6oBoPqewFmZGMNXmb47hZ6P2ymhaX8iFnLbD82YN',
				isRevoked: false,
				revokedIdentity: undefined
			};
			const revokeResult = {
				docUpdate: ServerIdentityMock.doc,
				revoked: false
			};
			const getLinkedKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'getLinkedKeyCollectionIdentity').and.returnValue(linkedIdentity);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const revokeVerifiableCredentialSpy = spyOn(identityService, 'revokeVerifiableCredential').and.returnValue(revokeResult);
			const updateIdentityDocSpy = spyOn(IdentitiesDb, 'updateIdentityDoc');
			const revokeKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'revokeKeyCollectionIdentity');
			const updateUserVerificationSpy = spyOn(userService, 'updateUserVerification');
			const req: any = {
				user: { userId: 'did:iota:1234' }, // same request user id as initiatorId
				params: {},
				body: { subjectId: identityToRevoke }
			};

			await authenticationRoutes.revokeVerifiableCredential(req, res, nextMock);

			expect(getLinkedKeyCollectionIdentitySpy).toHaveBeenCalledWith(identityToRevoke);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(revokeVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, linkedIdentity.index);
			expect(updateIdentityDocSpy).toHaveBeenCalledWith(revokeResult.docUpdate);
			expect(revokeKeyCollectionIdentitySpy).not.toHaveBeenCalled();
			expect(updateUserVerificationSpy).not.toHaveBeenCalled();
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
		});
	});
});
