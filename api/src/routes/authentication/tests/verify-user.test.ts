import { KEY_COLLECTION_INDEX } from '../../../config/identity';
import { CredentialSubject } from '../../../models/types/identity';
import { DeviceIdentityMock, ServerIdentityMock, TestUsersMock } from '../../../test/mocks/identities';
import * as KeyCollectionDB from '../../../database/key-collection';
import * as KeyCollectionLinksDB from '../../../database/key-collection-links';
import * as IdentitiesDb from '../../../database/identities';
import { IdentityService } from '../../../services/identity-service';
import { UserService } from '../../../services/user-service';
import { AuthenticationService } from '../../../services/authentication-service';
import { AuthenticationRoutes } from '..';
import { IdentityConfig } from '../../../models/config';
import { StatusCodes } from 'http-status-codes';
import { KeyCollectionMock } from '../../../test/mocks/key-collection';

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
	describe('test verifyUser route', () => {
		let createVerifiableCredentialSpy: any, keyCollectionIndex: any, getKeyCollectionSpy: any;
		let getLinkedIdentitySpy: any, addKeyCollectionIdentitySpy: any, updateUserVerificationSpy: any, addUserVCSpy: any;
		beforeEach(() => {
			keyCollectionIndex = 0;
			createVerifiableCredentialSpy = spyOn(identityService, 'createVerifiableCredential').and.returnValue({ VCMOCK: 1 });
			getKeyCollectionSpy = spyOn(KeyCollectionDB, 'getKeyCollection').and.returnValue(KeyCollectionMock);
			getLinkedIdentitySpy = spyOn(KeyCollectionLinksDB, 'getLinkedIdentitesSize').and.returnValue(keyCollectionIndex);
			addKeyCollectionIdentitySpy = spyOn(KeyCollectionLinksDB, 'addKeyCollectionIdentity');
			updateUserVerificationSpy = spyOn(userService, 'updateUserVerification');
			addUserVCSpy = spyOn(userService, 'addUserVC');
		});

		it('should not verify since different userId in request', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(subject);
			const req: any = {
				userId: 'WRONGUSERID',
				params: {},
				body: {
					subjectId: subject.userId,
					initiatorVC
				}
			};
			await authenticationRoutes.verifyUser(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(subject.userId);
			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(KEY_COLLECTION_INDEX);
			expect(nextMock).toHaveBeenCalledWith(new Error('user id of request does not concur with the initiatorVC user id!'));
		});

		it('should not verify since no valid credentialSubject!', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = DeviceIdentityMock.userData.verifiableCredentials[0];
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(subject);
			const req: any = {
				userId: initiatorVC.id,
				params: {},
				body: {
					subjectId: subject.userId,
					initiatorVC: {
						...initiatorVC,
						credentialSubject: null
					}
				}
			};
			await authenticationRoutes.verifyUser(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(subject.userId);
			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(KEY_COLLECTION_INDEX);
			expect(nextMock).toHaveBeenCalledWith(new Error('no valid verfiable credential!'));
		});

		it('should not verify since initiator is a device!', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = DeviceIdentityMock.userData.verifiableCredentials[0];
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(subject);
			const req: any = {
				userId: initiatorVC.id,
				params: {},
				body: {
					subjectId: subject.userId,
					initiatorVC
				}
			};
			await authenticationRoutes.verifyUser(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(subject.userId);
			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(KEY_COLLECTION_INDEX);
			expect(nextMock).toHaveBeenCalledWith(new Error('initiator is a device!'));
		});

		it('should not verify since vc of initiator is not verified (initiatorVcIsVerified=false).', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(subject);
			const initiatorVcIsVerified = false;

			const checkVerifiableCredentialSpy = spyOn(authenticationService, 'checkVerifiableCredential').and.returnValue(initiatorVcIsVerified);
			const req: any = {
				userId: initiatorVC.id,
				params: {},
				body: {
					subjectId: subject.userId,
					initiatorVC
				}
			};
			await authenticationRoutes.verifyUser(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(subject.userId);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(initiatorVC);
			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(KEY_COLLECTION_INDEX);
			expect(nextMock).toHaveBeenCalledWith(new Error('initiator has to be verified!'));
		});

		it('should not verify since initiator is in different organization.', async () => {
			const subject = TestUsersMock[1];
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(subject);
			const initiatorVcIsVerified = true;
			const checkVerifiableCredentialSpy = spyOn(authenticationService, 'checkVerifiableCredential').and.returnValue(initiatorVcIsVerified);
			const req: any = {
				userId: initiatorVC.id,
				params: {},
				body: {
					subjectId: subject.userId,
					initiatorVC
				}
			};
			await authenticationRoutes.verifyUser(req, res, nextMock);

			expect(subject.organization).not.toEqual(initiatorVC.credentialSubject.organization);
			expect(getUserSpy).toHaveBeenCalledWith(subject.userId);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(initiatorVC);
			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(KEY_COLLECTION_INDEX);
			expect(nextMock).toHaveBeenCalledWith(new Error('user must be in same organization!'));
		});

		it('should create vc for valid a', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const getUserSpy = spyOn(userService, 'getUser').and.returnValue(subject);
			const initiatorVcIsVerified = true;
			const checkVerifiableCredentialSpy = spyOn(authenticationService, 'checkVerifiableCredential').and.returnValue(initiatorVcIsVerified);
			const getIdentitySpy = spyOn(IdentitiesDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const req: any = {
				userId: initiatorVC.id,
				params: {},
				body: {
					subjectId: subject.userId,
					initiatorVC
				}
			};

			const credentialSubject: CredentialSubject = {
				classification: subject.classification,
				id: subject.userId,
				organization: subject.organization,
				registrationDate: subject.registrationDate,
				username: subject.username
			};
			const expectedCredential = {
				type: 'UserCredential',
				id: subject.userId,
				subject: {
					...credentialSubject
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
				linkedIdentity: subject.userId
			};
			await authenticationRoutes.verifyUser(req, res, nextMock);

			expect(getUserSpy).toHaveBeenCalledWith(subject.userId);
			expect(getKeyCollectionSpy).toHaveBeenCalledWith(KEY_COLLECTION_INDEX);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(initiatorVC);
			expect(getLinkedIdentitySpy).toHaveBeenCalledWith(KEY_COLLECTION_INDEX);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(createVerifiableCredentialSpy).toHaveBeenCalledWith(ServerIdentityMock, expectedCredential, expectedKeyCollection, keyCollectionIndex);
			expect(addKeyCollectionIdentitySpy).toHaveBeenCalledWith(expectedAddKeyCollectionCall);
			expect(updateUserVerificationSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					verified: true
				})
			);
			expect(addUserVCSpy).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
			expect(res.send).toHaveBeenCalledWith({ VCMOCK: 1 });
		});
	});
});
