import { KEY_COLLECTION_INDEX } from '../../../config/identity';
import { CredentialSubject } from '../../../models/types/identity';
import { DeviceIdentityMock, ServerIdentityMock, TestUsersMock } from '../../../test/mocks/identities';
import * as KeyCollectionDB from '../../../database/key-collection';
import * as KeyCollectionLinksDB from '../../../database/verifiable-credentials';
import * as IdentityDocsDb from '../../../database/identity-docs';
import { SsiService } from '../../../services/ssi-service';
import { IdentityService } from '../../../services/identity-service';
import { AuthenticationService } from '../../../services/authentication-service';
import { AuthenticationRoutes } from '..';
import { IdentityConfig } from '../../../models/config';
import { StatusCodes } from 'http-status-codes';
import { KeyCollectionMock } from '../../../test/mocks/key-collection';
import { AuthorizationService } from '../../../services/authorization-service';
import { UserType, UserRoles } from '../../../models/types/user';

describe('test authentication routes', () => {
	const serverSecret = 'very-secret-secret';
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let identityService: IdentityService;
	let ssiService: SsiService, authenticationService: AuthenticationService, authenticationRoutes: AuthenticationRoutes;
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
		ssiService = SsiService.getInstance(identityConfig);
		identityService = new IdentityService();
		const authorizationService = new AuthorizationService(identityService);
		authenticationService = new AuthenticationService(ssiService, identityService, {
			jwtExpiration: '2 days',
			serverSecret,
			serverIdentityId: ServerIdentityMock.doc.id
		});
		authenticationRoutes = new AuthenticationRoutes(authenticationService, identityService, authorizationService, config);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});
	describe('test verifyIdentity route', () => {
		let createVerifiableCredentialSpy: any, keyCollectionIndex: any, getKeyCollectionSpy: any;
		let getNextCredentialIndexSpy: any, addVerifiableCredentialSpy: any, updateUserVerificationSpy: any, addUserVCSpy: any;
		const vcMock = { VCMOCK: 1 };
		beforeEach(() => {
			keyCollectionIndex = 0;
			createVerifiableCredentialSpy = spyOn(ssiService, 'createVerifiableCredential').and.returnValue(vcMock);
			getKeyCollectionSpy = spyOn(KeyCollectionDB, 'getKeyCollection').and.returnValue(KeyCollectionMock);
			getNextCredentialIndexSpy = spyOn(KeyCollectionLinksDB, 'getNextCredentialIndex').and.returnValue(keyCollectionIndex);
			addVerifiableCredentialSpy = spyOn(KeyCollectionLinksDB, 'addVerifiableCredential');
			updateUserVerificationSpy = spyOn(identityService, 'updateUserVerification');
			addUserVCSpy = spyOn(identityService, 'addUserVC');
		});

		it('should not verify since different userId in request', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const getUserSpy = spyOn(identityService, 'getUser').and.returnValue(subject);
			const req: any = {
				user: { userId: 'WRONGUSERID' },
				params: {},
				body: {
					subjectId: subject.userId,
					initiatorVC
				}
			};
			await authenticationRoutes.verifyIdentity(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(subject.userId);
			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(KEY_COLLECTION_INDEX, ServerIdentityMock.doc.id);
			expect(nextMock).toHaveBeenCalledWith(new Error('user id of request does not concur with the initiatorVC user id!'));
		});

		it('should not verify since no valid credentialSubject!', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = DeviceIdentityMock.userData.verifiableCredentials[0];
			const getUserSpy = spyOn(identityService, 'getUser').and.returnValue(subject);
			const req: any = {
				user: { userId: initiatorVC.id },
				params: {},
				body: {
					subjectId: subject.userId,
					initiatorVC: {
						...initiatorVC,
						credentialSubject: null
					}
				}
			};
			await authenticationRoutes.verifyIdentity(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(subject.userId);
			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(KEY_COLLECTION_INDEX, ServerIdentityMock.doc.id);
			expect(nextMock).toHaveBeenCalledWith(new Error('no valid verfiable credential!'));
		});

		it('should not verify since initiator is not allowed to authorize others!', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = DeviceIdentityMock.userData.verifiableCredentials[0];
			const getUserSpy = spyOn(identityService, 'getUser').and.returnValue(subject);
			const req: any = {
				user: { userId: initiatorVC.id },
				params: {},
				body: {
					subjectId: subject.userId,
					initiatorVC
				}
			};
			await authenticationRoutes.verifyIdentity(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(subject.userId);
			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(KEY_COLLECTION_INDEX, ServerIdentityMock.doc.id);
			expect(nextMock).toHaveBeenCalledWith(new Error('initiator is not allowed based on its type!'));
		});

		it('should not verify since vc of initiator is not verified (initiatorVcIsVerified=false).', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const getUserSpy = spyOn(identityService, 'getUser').and.returnValue(subject);
			const initiatorVcIsVerified = false;

			const checkVerifiableCredentialSpy = spyOn(authenticationService, 'checkVerifiableCredential').and.returnValue(initiatorVcIsVerified);
			const req: any = {
				user: { userId: initiatorVC.id, type: UserType.Person },
				params: {},
				body: {
					subjectId: subject.userId,
					initiatorVC
				}
			};
			await authenticationRoutes.verifyIdentity(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(subject.userId);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(initiatorVC);
			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(KEY_COLLECTION_INDEX, ServerIdentityMock.doc.id);
			expect(nextMock).toHaveBeenCalledWith(new Error('initiator has to be verified!'));
		});

		it('should not verify since initiator is in different organization.', async () => {
			const subject = TestUsersMock[1];
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const getUserSpy = spyOn(identityService, 'getUser').and.returnValue(subject);
			const req: any = {
				user: { userId: initiatorVC.id, type: UserType.Person },
				params: {},
				body: {
					subjectId: subject.userId,
					initiatorVC
				}
			};
			await authenticationRoutes.verifyIdentity(req, res, nextMock);

			expect(subject.organization).not.toEqual(initiatorVC.credentialSubject.organization);
			expect(getUserSpy).toHaveBeenCalledWith(subject.userId);
			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(KEY_COLLECTION_INDEX, ServerIdentityMock.doc.id);
			expect(nextMock).toHaveBeenCalledWith(new Error('user must be in same organization!'));
		});

		it('should not verify since initiator is admin but a device', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const getUserSpy = spyOn(identityService, 'getUser').and.returnValue(subject);
			spyOn(authenticationService, 'checkVerifiableCredential').and.returnValue(true);
			spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const req: any = {
				user: { userId: initiatorVC.id, type: UserType.Device, role: UserRoles.Admin },
				params: {},
				body: {
					subjectId: subject.userId,
					initiatorVC
				}
			};
			await authenticationRoutes.verifyIdentity(req, res, nextMock);

			expect(subject.organization).toEqual(initiatorVC.credentialSubject.organization);
			expect(getUserSpy).toHaveBeenCalledWith(subject.userId);
			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(KEY_COLLECTION_INDEX, ServerIdentityMock.doc.id);
			expect(nextMock).toHaveBeenCalledWith(new Error('initiator is not allowed based on its type!'));
		});

		it('should verify for user which has valid vc and different organization but admin user', async () => {
			const subject = TestUsersMock[1];
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const getUserSpy = spyOn(identityService, 'getUser').and.returnValue(subject);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const req: any = {
				user: { userId: initiatorVC.id, role: UserRoles.Admin, type: UserType.Person },
				params: {},
				body: {
					subjectId: subject.userId,
					initiatorVC
				}
			};

			const credentialSubject: CredentialSubject = {
				type: subject.type,
				id: subject.userId,
				organization: subject.organization,
				registrationDate: subject.registrationDate,
				initiatorId: initiatorVC.id
			};
			const expectedCredential: any = {
				type: 'PersonCredential',
				id: subject.userId,
				subject: {
					...credentialSubject,
					'@context': 'https://schema.org/',
					type: 'Person',
					...subject.data
				}
			};
			const expectedKeyCollection = {
				type: KeyCollectionMock.type,
				keys: KeyCollectionMock.keys
			};
			const expectedAddKeyCollectionCall = {
				index: 0,
				isRevoked: false,
				keyCollectionIndex: 0,
				initiatorId: initiatorVC.id,
				vc: vcMock
			};
			await authenticationRoutes.verifyIdentity(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(subject.userId);
			expect(getKeyCollectionSpy).toHaveBeenCalledWith(KEY_COLLECTION_INDEX, ServerIdentityMock.doc.id, serverSecret);
			expect(getNextCredentialIndexSpy).toHaveBeenCalledWith(KEY_COLLECTION_INDEX, ServerIdentityMock.doc.id);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(createVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, expectedCredential, expectedKeyCollection, keyCollectionIndex);
			expect(addVerifiableCredentialSpy).toHaveBeenCalledWith(expectedAddKeyCollectionCall, ServerIdentityMock.doc.id);
			expect(updateUserVerificationSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					verified: true
				})
			);
			expect(addUserVCSpy).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith(vcMock);
		});

		it('should verify for user which has valid vc and is in same organization', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const getUserSpy = spyOn(identityService, 'getUser').and.returnValue(subject);
			const initiatorVcIsVerified = true;
			const checkVerifiableCredentialSpy = spyOn(authenticationService, 'checkVerifiableCredential').and.returnValue(initiatorVcIsVerified);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const req: any = {
				user: { userId: initiatorVC.id, type: UserType.Person },
				params: {},
				body: {
					subjectId: subject.userId,
					initiatorVC
				}
			};

			const credentialSubject: CredentialSubject = {
				type: subject.type,
				id: subject.userId,
				organization: subject.organization,
				registrationDate: subject.registrationDate,
				initiatorId: initiatorVC.id
			};
			const expectedCredential: any = {
				type: 'DeviceCredential',
				id: subject.userId,
				subject: {
					...credentialSubject,
					'@context': ['https://smartdatamodels.org/context.jsonld'],
					type: 'Device',
					...subject.data,
					id: subject.userId
				}
			};
			const expectedKeyCollection = {
				type: KeyCollectionMock.type,
				keys: KeyCollectionMock.keys
			};
			const expectedAddKeyCollectionCall = {
				index: 0,
				isRevoked: false,
				keyCollectionIndex: 0,
				initiatorId: initiatorVC.id,
				vc: vcMock
			};
			await authenticationRoutes.verifyIdentity(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(subject.userId);
			expect(getKeyCollectionSpy).toHaveBeenCalledWith(KEY_COLLECTION_INDEX, ServerIdentityMock.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(initiatorVC);
			expect(getNextCredentialIndexSpy).toHaveBeenCalledWith(KEY_COLLECTION_INDEX, ServerIdentityMock.doc.id);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(createVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, expectedCredential, expectedKeyCollection, keyCollectionIndex);
			expect(addVerifiableCredentialSpy).toHaveBeenCalledWith(expectedAddKeyCollectionCall, ServerIdentityMock.doc.id);
			expect(updateUserVerificationSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					verified: true
				})
			);
			expect(addUserVCSpy).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith(vcMock);
		});
	});
});
