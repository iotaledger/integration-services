import { CredentialSubject } from '../../../models/types/identity';
import { DeviceIdentityMock, ServerIdentityMock, TestUsersMock } from '../../../test/mocks/identities';
import * as KeyCollectionDB from '../../../database/key-collection';
import * as KeyCollectionLinksDB from '../../../database/verifiable-credentials';
import * as IdentityDocsDb from '../../../database/identity-docs';
import { SsiService } from '../../../services/ssi-service';
import { UserService } from '../../../services/user-service';
import { VerificationService } from '../../../services/verification-service';
import { VerificationRoutes } from '..';
import { IdentityConfig } from '../../../models/config';
import { StatusCodes } from 'http-status-codes';
import { KeyCollectionMock } from '../../../test/mocks/key-collection';
import { AuthorizationService } from '../../../services/authorization-service';
import { UserType, UserRoles } from '../../../models/types/user';

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
		ssiService = SsiService.getInstance(identityConfig);
		userService = new UserService({} as any, '');
		const authorizationService = new AuthorizationService();
		verificationService = new VerificationService(ssiService, userService, {
			serverSecret,
			serverIdentityId: ServerIdentityMock.doc.id,
			keyCollectionSize: 2
		});
		verificationRoutes = new VerificationRoutes(verificationService, authorizationService, config);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});
	describe('test verifyIdentity route', () => {
		let createVerifiableCredentialSpy: any, keyCollectionIndex: any, getKeyCollectionSpy: any;
		let getNextCredentialIndexSpy: any, addVerifiableCredentialSpy: any, addUserVCSpy: any;
		const vcMock = { VCMOCK: 1 };
		beforeEach(() => {
			keyCollectionIndex = 0;
			createVerifiableCredentialSpy = spyOn(ssiService, 'createVerifiableCredential').and.returnValue(vcMock);
			getKeyCollectionSpy = spyOn(KeyCollectionDB, 'getKeyCollection').and.returnValue(KeyCollectionMock);
			getNextCredentialIndexSpy = spyOn(KeyCollectionLinksDB, 'getNextCredentialIndex').and.returnValue(keyCollectionIndex);
			addVerifiableCredentialSpy = spyOn(KeyCollectionLinksDB, 'addVerifiableCredential');
			addUserVCSpy = spyOn(userService, 'addUserVC');
		});

		it('should not verify since different identityId in request', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const req: any = {
				user: { identityId: 'WRONGUSERID' },
				params: {},
				body: {
					subject: {
						identityId: subject.identityId,
						credentialType: 'VerifiedIdentityCredential',
						claim: { ...subject.claim, type: subject.type }
					},
					initiatorVC
				}
			};
			await verificationRoutes.createVerifiableCredential(req, res, nextMock);

			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(nextMock).toHaveBeenCalledWith(new Error('user id of request does not concur with the initiatorVC user id!'));
		});

		it('should not verify since no valid credentialSubject!', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = DeviceIdentityMock.userData.verifiableCredentials[0];
			const req: any = {
				user: { identityId: initiatorVC.id },
				params: {},
				body: {
					subject: {
						identityId: subject.identityId,
						credentialType: 'VerifiedIdentityCredential',
						claim: { ...subject.claim, type: subject.type }
					},
					initiatorVC: {
						...initiatorVC,
						credentialSubject: null
					}
				}
			};
			await verificationRoutes.createVerifiableCredential(req, res, nextMock);

			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(nextMock).toHaveBeenCalledWith(new Error('no valid verfiable credential!'));
		});

		it('should not verify since initiator is not allowed to authorize others!', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = DeviceIdentityMock.userData.verifiableCredentials[0];
			const req: any = {
				user: { identityId: initiatorVC.id },
				params: {},
				body: {
					subject: {
						identityId: subject.identityId,
						credentialType: 'VerifiedIdentityCredential',
						claim: { ...subject.claim, type: subject.type }
					},
					initiatorVC
				}
			};
			await verificationRoutes.createVerifiableCredential(req, res, nextMock);

			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(nextMock).toHaveBeenCalledWith(new Error('initiator is not allowed based on its identity type!'));
		});

		it('should not verify for user which has valid vc but credential is not from type VerifiedIdentityCredential', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[1]; // this credential is from type SomeBasicCredential
			const req: any = {
				user: { identityId: initiatorVC.id, type: UserType.Person },
				params: {},
				body: {
					subject: {
						identityId: subject.identityId,
						credentialType: 'VerifiedIdentityCredential',
						claim: { ...subject.claim, type: subject.type }
					},
					initiatorVC
				}
			};

			await verificationRoutes.createVerifiableCredential(req, res, nextMock);

			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(nextMock).toHaveBeenCalledWith(new Error('initiator is not allowed based on its credential type!'));
		});

		it('should not verify since vc of initiator is not verified (initiatorVcIsVerified=false).', async () => {
			const subject = TestUsersMock[0];
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const initiatorVcIsVerified = false;

			const checkVerifiableCredentialSpy = spyOn(verificationService, 'checkVerifiableCredential').and.returnValue(initiatorVcIsVerified);
			const req: any = {
				user: { identityId: initiatorVC.id, type: UserType.Person },
				params: {},
				body: {
					subject: {
						identityId: subject.identityId,
						credentialType: 'VerifiedIdentityCredential',
						claim: { ...subject.claim, type: subject.type }
					},
					initiatorVC
				}
			};
			await verificationRoutes.createVerifiableCredential(req, res, nextMock);

			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(initiatorVC);
			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(nextMock).toHaveBeenCalledWith(new Error('initiatorVC is not verified!'));
		});

		it('should verify for user which has valid vc and different organization but admin user', async () => {
			const subject = TestUsersMock[1];
			const keyIndex = 0;
			const keyCollectionIndex = 0;
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const req: any = {
				user: { identityId: initiatorVC.id, role: UserRoles.Admin, type: UserType.Person },
				params: {},
				body: {
					subject: {
						identityId: subject.identityId,
						credentialType: 'VerifiedIdentityCredential',
						claim: { ...subject.claim, type: subject.type }
					},
					initiatorVC
				}
			};

			const credentialSubject: CredentialSubject = {
				type: subject.type,
				id: subject.identityId,
				initiatorId: initiatorVC.id
			};
			const expectedCredential: any = {
				type: 'VerifiedIdentityCredential',
				id: subject.identityId,
				subject: {
					...credentialSubject,
					'@context': 'https://schema.org/',
					type: 'Person',
					...subject.claim
				}
			};
			const expectedKeyCollection = {
				type: KeyCollectionMock.type,
				keys: KeyCollectionMock.keys
			};
			const expectedAddKeyCollectionCall = {
				index: keyIndex,
				isRevoked: false,
				initiatorId: initiatorVC.id,
				vc: vcMock
			};
			await verificationRoutes.createVerifiableCredential(req, res, nextMock);

			expect(getKeyCollectionSpy).toHaveBeenCalledWith(keyCollectionIndex, ServerIdentityMock.doc.id, serverSecret);
			expect(getNextCredentialIndexSpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(createVerifiableCredentialSpy).toHaveBeenCalledWith(
				ServerIdentityMock,
				expectedCredential,
				expectedKeyCollection,
				keyCollectionIndex,
				keyIndex
			);
			expect(addVerifiableCredentialSpy).toHaveBeenCalledWith(expectedAddKeyCollectionCall, ServerIdentityMock.doc.id);
			expect(addUserVCSpy).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith(vcMock);
		});

		it('should verify for user which has valid vc and is in same organization', async () => {
			const subject = TestUsersMock[0];
			const keyCollectionIndex = 0;
			const keyIndex = 0;
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const initiatorVcIsVerified = true;
			const checkVerifiableCredentialSpy = spyOn(verificationService, 'checkVerifiableCredential').and.returnValue(initiatorVcIsVerified);
			const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue(ServerIdentityMock);
			const req: any = {
				user: { identityId: initiatorVC.id, type: UserType.Person },
				params: {},
				body: {
					subject: {
						identityId: subject.identityId,
						credentialType: 'VerifiedIdentityCredential',
						claim: { ...subject.claim, type: subject.type }
					},
					initiatorVC
				}
			};

			const credentialSubject: CredentialSubject = {
				type: subject.type,
				id: subject.identityId,
				initiatorId: initiatorVC.id
			};
			const expectedCredential: any = {
				type: 'VerifiedIdentityCredential',
				id: subject.identityId,
				subject: {
					...credentialSubject,
					'@context': ['https://smartdatamodels.org/context.jsonld'],
					type: 'Device',
					...subject.claim,
					id: subject.identityId
				}
			};
			const expectedKeyCollection = {
				type: KeyCollectionMock.type,
				keys: KeyCollectionMock.keys
			};
			const expectedAddKeyCollectionCall = {
				index: keyIndex,
				isRevoked: false,
				initiatorId: initiatorVC.id,
				vc: vcMock
			};
			await verificationRoutes.createVerifiableCredential(req, res, nextMock);

			expect(getKeyCollectionSpy).toHaveBeenCalledWith(keyCollectionIndex, ServerIdentityMock.doc.id, serverSecret);
			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(initiatorVC);
			expect(getNextCredentialIndexSpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(getIdentitySpy).toHaveBeenCalledWith(ServerIdentityMock.doc.id, serverSecret);
			expect(createVerifiableCredentialSpy).toHaveBeenCalledWith(
				ServerIdentityMock,
				expectedCredential,
				expectedKeyCollection,
				keyCollectionIndex,
				keyIndex
			);
			expect(addVerifiableCredentialSpy).toHaveBeenCalledWith(expectedAddKeyCollectionCall, ServerIdentityMock.doc.id);
			expect(addUserVCSpy).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith(vcMock);
		});
	});
});
