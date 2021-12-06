import { CredentialSubject } from '../../../models/types/identity';
import { DeviceIdentityMock, ServerIdentityMock, TestUsersMock, ServerIdentityKey } from '../../../test/mocks/identities';
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
import { LoggerMock } from '../../../test/mocks/logger';
import { IdentityConfigMock } from '../../../test/mocks/config';
import { ConfigurationServiceMock } from '../../../test/mocks/service-mocks';

describe('test authentication routes', () => {
	const serverSecret = ConfigurationServiceMock.config.serverSecret;
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
	describe('test verifyIdentity route', () => {
		let createVerifiableCredentialSpy: any, keyCollectionIndex: any, getKeyCollectionSpy: any;
		let getNextCredentialIndexSpy: any, addVerifiableCredentialSpy: any, addUserVCSpy: any;
		const vcMock: any = { VCMOCK: 1 };
		beforeEach(() => {
			keyCollectionIndex = 0;
			createVerifiableCredentialSpy = jest.spyOn(ssiService, 'createVerifiableCredential').mockImplementation(async () => vcMock);
			getKeyCollectionSpy = jest.spyOn(KeyCollectionDB, 'getKeyCollection').mockImplementation(async () => KeyCollectionMock);
			getNextCredentialIndexSpy = jest
				.spyOn(KeyCollectionLinksDB, 'getNextCredentialIndex')
				.mockImplementation(async () => keyCollectionIndex);
			addVerifiableCredentialSpy = jest.spyOn(KeyCollectionLinksDB, 'addVerifiableCredential').mockImplementation(() => null);
			addUserVCSpy = jest.spyOn(userService, 'addUserVC').mockImplementation(() => null);
		});

		it('should not verify since different id in request', async () => {
			const subject = TestUsersMock[0];
			const loggerSpy = jest.spyOn(LoggerMock, 'error');
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const req: any = {
				user: { id: 'WRONGUSERID' },
				params: {},
				body: {
					subject: {
						id: subject.id,
						credentialType: 'VerifiedIdentityCredential',
						claim: { ...subject.claim, type: subject.type }
					},
					initiatorVC
				}
			};
			await verificationRoutes.createVerifiableCredential(req, res, nextMock);

			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(loggerSpy).toHaveBeenCalledWith(new Error('user id of request does not concur with the initiatorVC user id!'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not create the verifiable credential'));
		});

		it('should not verify since no valid credentialSubject!', async () => {
			const subject = TestUsersMock[0];
			const loggerSpy = jest.spyOn(LoggerMock, 'error');
			const initiatorVC = DeviceIdentityMock.userData.verifiableCredentials[0];
			const req: any = {
				user: { id: initiatorVC.id },
				params: {},
				body: {
					subject: {
						id: subject.id,
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
			expect(loggerSpy).toHaveBeenCalledWith(new Error('no valid verfiable credential!'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not create the verifiable credential'));
		});

		it('should not verify since initiator is not allowed to authorize others!', async () => {
			const subject = TestUsersMock[0];
			const loggerSpy = jest.spyOn(LoggerMock, 'error');
			const initiatorVC = DeviceIdentityMock.userData.verifiableCredentials[0];
			const req: any = {
				user: { id: initiatorVC.id },
				params: {},
				body: {
					subject: {
						id: subject.id,
						credentialType: 'VerifiedIdentityCredential',
						claim: { ...subject.claim, type: subject.type }
					},
					initiatorVC
				}
			};
			await verificationRoutes.createVerifiableCredential(req, res, nextMock);

			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(loggerSpy).toHaveBeenCalledWith(new Error('initiator is not allowed based on its identity type!'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not create the verifiable credential'));
		});

		it('should not verify for user which has valid vc but credential is not from type VerifiedIdentityCredential', async () => {
			const subject = TestUsersMock[0];
			const loggerSpy = jest.spyOn(LoggerMock, 'error');
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[1]; // this credential is from type SomeBasicCredential
			const req: any = {
				user: { id: initiatorVC.id, type: UserType.Person },
				params: {},
				body: {
					subject: {
						id: subject.id,
						credentialType: 'VerifiedIdentityCredential',
						claim: { ...subject.claim, type: subject.type }
					},
					initiatorVC
				}
			};

			await verificationRoutes.createVerifiableCredential(req, res, nextMock);

			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(loggerSpy).toHaveBeenCalledWith(new Error('initiator is not allowed based on its credential type!'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not create the verifiable credential'));
		});

		it('should not verify since vc of initiator is not verified (initiatorVcIsVerified=false).', async () => {
			const subject = TestUsersMock[0];
			const loggerSpy = jest.spyOn(LoggerMock, 'error');
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const initiatorVcIsVerified = false;

			const checkVerifiableCredentialSpy = jest
				.spyOn(verificationService, 'checkVerifiableCredential')
				.mockImplementation(async () => initiatorVcIsVerified);
			const req: any = {
				user: { id: initiatorVC.id, type: UserType.Person },
				params: {},
				body: {
					subject: {
						id: subject.id,
						credentialType: 'VerifiedIdentityCredential',
						claim: { ...subject.claim, type: subject.type }
					},
					initiatorVC
				}
			};
			await verificationRoutes.createVerifiableCredential(req, res, nextMock);

			expect(checkVerifiableCredentialSpy).toHaveBeenCalledWith(initiatorVC);
			expect(getKeyCollectionSpy).not.toHaveBeenCalledWith(ServerIdentityMock.doc.id);
			expect(loggerSpy).toHaveBeenCalledWith(new Error('initiatorVC is not verified!'));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not create the verifiable credential'));
		});

		it('should verify for user which has valid vc and different organization but admin user', async () => {
			const subject = TestUsersMock[1];
			const keyIndex = 0;
			const keyCollectionIndex = 0;
			const initiatorVC = ServerIdentityMock.userData.verifiableCredentials[0];
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityDoc').mockImplementation(async () => ServerIdentityKey);
			const req: any = {
				user: { id: initiatorVC.id, role: UserRoles.Admin, type: UserType.Person },
				params: {},
				body: {
					subject: {
						id: subject.id,
						credentialType: 'VerifiedIdentityCredential',
						claim: { ...subject.claim, type: subject.type }
					},
					initiatorVC
				}
			};

			const credentialSubject: CredentialSubject = {
				type: subject.type,
				id: subject.id,
				initiatorId: initiatorVC.id
			};
			const expectedCredential: any = {
				type: 'VerifiedIdentityCredential',
				id: subject.id,
				subject: {
					...credentialSubject,
					'@context': 'https://schema.org/',
					type: 'Person',
					...subject.claim
				}
			};
			const expectedKeyCollection = {
				type: KeyCollectionMock.type,
				keys: KeyCollectionMock.keys,
				publicKeyBase58: 'testpublickey'
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
			const checkVerifiableCredentialSpy = jest
				.spyOn(verificationService, 'checkVerifiableCredential')
				.mockImplementation(async () => initiatorVcIsVerified);
			const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityDoc').mockImplementation(async () => ServerIdentityKey);
			const req: any = {
				user: { id: initiatorVC.id, type: UserType.Person },
				params: {},
				body: {
					subject: {
						id: subject.id,
						credentialType: 'VerifiedIdentityCredential',
						claim: { ...subject.claim, type: subject.type }
					},
					initiatorVC
				}
			};

			const credentialSubject: CredentialSubject = {
				type: subject.type,
				id: subject.id,
				initiatorId: initiatorVC.id
			};
			const expectedCredential: any = {
				type: 'VerifiedIdentityCredential',
				id: subject.id,
				subject: {
					...credentialSubject,
					'@context': ['https://smartdatamodels.org/context.jsonld'],
					type: 'Device',
					...subject.claim,
					id: subject.id
				}
			};
			const expectedKeyCollection = {
				type: KeyCollectionMock.type,
				keys: KeyCollectionMock.keys,
				publicKeyBase58: 'testpublickey'
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
	afterEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
	});
});
