import { KeyGenerator } from './key-generator';
import { ConfigurationServiceMock } from '../test/mocks/service-mocks';
import { LoggerMock } from '../test/mocks/logger';
import * as UserDb from '../database/user';
import * as IdentityDocs from '../database/identity-keys';
import { ServerIdentityMock, ServerIdentityKey } from '../test/mocks/identities';
import { UserService } from '../services/user-service';
import * as TrustedRootDb from '../database/trusted-roots';
import * as VerifiableCredentialDb from '../database/verifiable-credentials';
import { VerificationService } from '../services/verification-service';
import { CredentialTypes } from '@iota/is-shared-modules';

describe('test keygenerator', () => {
	let keyGenerator: KeyGenerator;
	beforeEach(() => {
		keyGenerator = new KeyGenerator(ConfigurationServiceMock, LoggerMock);
	});

	it('should throw error since found two serverIdentities', async () => {
		// found two server identities and so it throws an error
		const getServerIdentitiesSpy = jest.spyOn(UserDb, 'getServerIdentities').mockImplementationOnce(async () => [
			{ id: 'did:iota:1234', username: ServerIdentityMock.userData.username, publicKey: 'testpublickey' },
			{ id: 'did:iota:123456789', username: ServerIdentityMock.userData.username, publicKey: 'testpublickey2' }
		]);

		await expect(keyGenerator.keyGeneration()).rejects.toThrow('Database is in bad state: found 2 root identities');
		expect(getServerIdentitiesSpy).toHaveBeenCalled();
	});

	it('should return and log error since already found a serverIdentity but no document for it', async () => {
		// found one server identity but malicious format
		const getServerIdentitiesSpy = jest
			.spyOn(UserDb, 'getServerIdentities')
			.mockImplementationOnce(async () => [
				{ id: 'did:iota:1234', username: ServerIdentityMock.userData.username, publicKey: 'testpublickey' }
			]);
		const getIdentityKeysSpy = jest.spyOn(IdentityDocs, 'getIdentityKeys').mockImplementationOnce(async () => null);
		const loggerErrorSpy = jest.spyOn(LoggerMock, 'error').mockImplementationOnce(() => null);
		const loggerInfoSpy = jest.spyOn(LoggerMock, 'log').mockImplementationOnce(() => null);

		await keyGenerator.keyGeneration();

		expect(getServerIdentitiesSpy).toHaveBeenCalled();
		expect(getIdentityKeysSpy).toHaveBeenCalledWith('did:iota:1234', 'veryvery-very-very-server-secret');
		expect(loggerInfoSpy).toHaveBeenCalledWith('Root identity already exists: verify data');
		expect(loggerErrorSpy).toHaveBeenCalledWith('Error getting data from db');
	});

	it('should find an invalid serveridentity doc because public and secret key are not compatible', async () => {
		const unvalidServerIdentity = { ...ServerIdentityKey };
		unvalidServerIdentity.keys.sign.public = 'wrongpublickey'; // found identity has wrong server keypair stored
		const getServerIdentitiesSpy = jest.spyOn(UserDb, 'getServerIdentities').mockImplementationOnce(async () => [
			{
				id: ServerIdentityMock.document.doc.id,
				username: ServerIdentityMock.userData.username,
				publicKey: ServerIdentityMock.document.doc.capabilityInvocation[0].publicKeyMultibase
			}
		]);
		const getIdentityKeysSpy = jest.spyOn(IdentityDocs, 'getIdentityKeys').mockImplementationOnce(async () => unvalidServerIdentity);
		const loggerInfoSpy = jest.spyOn(LoggerMock, 'log').mockImplementationOnce(() => null);
		const loggerErrorSpy = jest.spyOn(LoggerMock, 'error').mockImplementationOnce(() => null);

		await keyGenerator.keyGeneration();

		expect(getServerIdentitiesSpy).toHaveBeenCalled();
		expect(getIdentityKeysSpy).toHaveBeenCalledWith(
			'did:iota:GEpCtmCAqr9mdR1zC5iL6bg1jAq8NmR8QmmdH8T7eFtm',
			'veryvery-very-very-server-secret'
		);
		expect(loggerInfoSpy).toHaveBeenCalledWith('Root identity already exists: verify data');
		expect(loggerErrorSpy).toHaveBeenCalledWith('error when signing or verifying the nonce, the secret key might have changed...');
		expect(loggerErrorSpy).toHaveBeenCalledWith('Root identity malformed or not valid: ' + unvalidServerIdentity.id);
	});

	it('should create a new serveridentity since none exists but user not found', async () => {
		UserService.prototype.createIdentity = jest.fn().mockImplementationOnce(async () => ServerIdentityMock);
		UserService.prototype.getUser = jest.fn().mockImplementationOnce(async () => null); // no user found

		jest.spyOn(UserDb, 'getServerIdentities').mockImplementation(async () => []);
		jest.spyOn(IdentityDocs, 'getIdentityKeys').mockImplementationOnce(async () => ServerIdentityKey);

		await expect(keyGenerator.keyGeneration()).rejects.toThrow('server user not found!');
	});

	it('should create a new serveridentity but could not create bitmap since returns null', async () => {
		UserService.prototype.createIdentity = jest.fn().mockImplementationOnce(async () => ServerIdentityMock);
		UserService.prototype.getUser = jest.fn().mockImplementationOnce(async () => ServerIdentityMock.userData);
		VerificationService.prototype.getBitmapIndex = jest.fn();
		VerificationService.prototype.getBitmap = jest.fn().mockImplementationOnce(async () => null); // no bitmap

		jest.spyOn(UserDb, 'getServerIdentities').mockImplementation(async () => []);
		jest.spyOn(IdentityDocs, 'getIdentityKeys').mockImplementationOnce(async () => ServerIdentityKey);
		jest.spyOn(TrustedRootDb, 'addTrustedRootId').mockImplementationOnce(async () => null);
		jest.spyOn(TrustedRootDb, 'getTrustedRootIds').mockImplementationOnce(async () => [{ id: ServerIdentityMock.document.doc.id }]);
		jest.spyOn(VerifiableCredentialDb, 'getNextCredentialIndex').mockImplementationOnce(async () => 1);

		await expect(keyGenerator.keyGeneration()).rejects.toThrow('could not create the bitmap!');
	});

	it('should create a new serveridentity and successfully run the script till the end', async () => {
		const userData: any = {
			...ServerIdentityMock.userData,
			verifiableCredentials: []
		};
		UserService.prototype.createIdentity = jest.fn().mockImplementationOnce(async () => ServerIdentityMock);
		UserService.prototype.getUser = jest.fn().mockImplementationOnce(async () => userData);
		VerificationService.prototype.getBitmapIndex = jest.fn();
		VerificationService.prototype.getBitmap = jest.fn().mockImplementationOnce(async () => []);
		const issueCredentialSpy = jest.fn();
		VerificationService.prototype.issueVerifiableCredential = issueCredentialSpy;

		jest.spyOn(UserDb, 'getServerIdentities').mockImplementation(async () => []);
		jest.spyOn(IdentityDocs, 'getIdentityKeys').mockImplementationOnce(async () => ServerIdentityKey);
		jest.spyOn(TrustedRootDb, 'addTrustedRootId').mockImplementationOnce(async () => null);
		jest.spyOn(TrustedRootDb, 'getTrustedRootIds').mockImplementationOnce(async () => [{ id: ServerIdentityMock.document.doc.id }]);
		jest.spyOn(VerifiableCredentialDb, 'getNextCredentialIndex').mockImplementationOnce(async () => 1);
		const loggerInfoSpy = jest.spyOn(LoggerMock, 'log').mockImplementationOnce(() => null);

		await keyGenerator.keyGeneration();

		const sub = {
			claim: ServerIdentityMock.userData.claim,
			credentialType: CredentialTypes.VerifiedIdentityCredential,
			id: ServerIdentityMock.userData.id
		};

		expect(loggerInfoSpy).toHaveBeenCalledWith('Setting root identity please wait...');
		expect(loggerInfoSpy).toHaveBeenCalledWith('Verify if root identity already exists...');
		expect(loggerInfoSpy).toHaveBeenCalledWith('creating the server identity...');
		expect(issueCredentialSpy).toHaveBeenCalledWith(sub, ServerIdentityMock.document.doc.id, ServerIdentityMock.document.doc.id); // should run till end of setup
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
		jest.resetModules();
	});
});
