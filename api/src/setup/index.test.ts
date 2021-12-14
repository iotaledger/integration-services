import { KeyGenerator } from '.';
import { ConfigurationServiceMock } from '../test/mocks/service-mocks';
import { LoggerMock } from '../test/mocks/logger';
import * as UserDb from '../database/user';
import * as IdentityDocs from '../database/identity-keys';
import { ServerIdentityMock, ServerIdentityKey } from '../test/mocks/identities';
import { UserService } from '../services/user-service';
import * as TrustedRootDb from '../database/trusted-roots';
import * as VerifiableCredentialDb from '../database/verifiable-credentials';
import { VerificationService } from '../services/verification-service';
import { CredentialTypes } from '../models/types/verification';

describe('test keygenerator', () => {
	let keyGenerator: KeyGenerator;
	beforeEach(() => {
		keyGenerator = new KeyGenerator(ConfigurationServiceMock, LoggerMock);
	});

	it('should throw error since found two serverIdentities', async () => {
		// found two server identities and so it throws an error
		const getServerIdentitiesSpy = jest.spyOn(UserDb, 'getServerIdentities').mockImplementationOnce(async () => [
			{ id: 'did:iota:1234', publicKey: 'testpublickey' },
			{ id: 'did:iota:123456789', publicKey: 'testpublickey2' }
		]);

		await expect(keyGenerator.keyGeneration()).rejects.toThrow('Database is in bad state: found 2 root identities');
		expect(getServerIdentitiesSpy).toHaveBeenCalled();
	});

	it('should return and log error since already found a serverIdentity but no document for it', async () => {
		// found one server identity but malicious format
		const getServerIdentitiesSpy = jest
			.spyOn(UserDb, 'getServerIdentities')
			.mockImplementationOnce(async () => [{ id: 'did:iota:1234', publicKey: 'testpublickey' }]);
		const getIdentityKeysSpy = jest.spyOn(IdentityDocs, 'getIdentityKeys').mockImplementationOnce(async () => null);
		const loggerSpy = jest.spyOn(LoggerMock, 'error').mockImplementationOnce(() => null);

		await keyGenerator.keyGeneration();

		expect(getServerIdentitiesSpy).toHaveBeenCalled();
		expect(getIdentityKeysSpy).toHaveBeenCalledWith('did:iota:1234', 'veryvery-very-very-server-secret');
		expect(loggerSpy).toHaveBeenCalledWith('Root identity already exists: verify data');
		expect(loggerSpy).toHaveBeenCalledWith('Error getting data from db');
	});

	it('should find a valid serveridentity doc', async () => {
		// found one server identity but malicious format
		const getServerIdentitiesSpy = jest
			.spyOn(UserDb, 'getServerIdentities')
			.mockImplementation(async () => [
				{ id: ServerIdentityMock.doc.id, publicKey: ServerIdentityMock.doc.authentication[0].publicKeyBase58 }
			]);
		const getIdentityKeysSpy = jest.spyOn(IdentityDocs, 'getIdentityKeys').mockImplementationOnce(async () => ServerIdentityKey);
		const loggerErrorSpy = jest.spyOn(LoggerMock, 'error').mockImplementationOnce(() => null);
		const loggerInfoSpy = jest.spyOn(LoggerMock, 'log').mockImplementationOnce(() => null);

		await keyGenerator.keyGeneration();

		expect(getServerIdentitiesSpy).toHaveBeenCalled();
		expect(getIdentityKeysSpy).toHaveBeenCalledWith(
			'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
			'veryvery-very-very-server-secret'
		);
		expect(loggerErrorSpy).toHaveBeenCalledWith('Root identity already exists: verify data');
		expect(loggerInfoSpy).toHaveBeenCalledWith('Setting root identity please wait...');
		expect(loggerInfoSpy).toHaveBeenCalledWith('Verify if root identity already exists...');
		expect(loggerInfoSpy).toHaveBeenCalledWith('Root identity is already defined and valid');
	});

	it('should find an invalid serveridentity doc because public and secret key are not compatible', async () => {
		const unvalidServerIdentity = { ...ServerIdentityKey };
		unvalidServerIdentity.key.public = 'wrongpublickey'; // found identity has wrong server keypair stored
		const getServerIdentitiesSpy = jest
			.spyOn(UserDb, 'getServerIdentities')
			.mockImplementationOnce(async () => [
				{ id: ServerIdentityMock.doc.id, publicKey: ServerIdentityMock.doc.authentication[0].publicKeyBase58 }
			]);
		const getIdentityKeysSpy = jest.spyOn(IdentityDocs, 'getIdentityKeys').mockImplementationOnce(async () => unvalidServerIdentity);
		const loggerErrorSpy = jest.spyOn(LoggerMock, 'error').mockImplementationOnce(() => null);

		await keyGenerator.keyGeneration();

		expect(getServerIdentitiesSpy).toHaveBeenCalled();
		expect(getIdentityKeysSpy).toHaveBeenCalledWith(
			'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
			'veryvery-very-very-server-secret'
		);
		expect(loggerErrorSpy).toHaveBeenCalledWith('Root identity already exists: verify data');
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

	it('should create a new serveridentity but could not create keycollection since returns null', async () => {
		UserService.prototype.createIdentity = jest.fn().mockImplementationOnce(async () => ServerIdentityMock);
		UserService.prototype.getUser = jest.fn().mockImplementationOnce(async () => ServerIdentityMock.userData);
		VerificationService.prototype.getKeyCollectionIndex = jest.fn();
		VerificationService.prototype.getKeyCollection = jest.fn().mockImplementationOnce(async () => null); // no keycollection

		jest.spyOn(UserDb, 'getServerIdentities').mockImplementation(async () => []);
		jest.spyOn(IdentityDocs, 'getIdentityKeys').mockImplementationOnce(async () => ServerIdentityKey);
		jest.spyOn(TrustedRootDb, 'addTrustedRootId').mockImplementationOnce(async () => null);
		jest.spyOn(VerifiableCredentialDb, 'getNextCredentialIndex').mockImplementationOnce(async () => 1);

		await expect(keyGenerator.keyGeneration()).rejects.toThrow('could not create the keycollection!');
	});

	it('should create a new serveridentity and successfully run the script till the end', async () => {
		UserService.prototype.createIdentity = jest.fn().mockImplementationOnce(async () => ServerIdentityMock);
		UserService.prototype.getUser = jest.fn().mockImplementationOnce(async () => ServerIdentityMock.userData);
		VerificationService.prototype.getKeyCollectionIndex = jest.fn();
		VerificationService.prototype.getKeyCollection = jest.fn().mockImplementationOnce(async () => []);
		const issueCredentialSpy = jest.fn();
		VerificationService.prototype.issueVerifiableCredential = issueCredentialSpy;

		jest.spyOn(UserDb, 'getServerIdentities').mockImplementation(async () => []);
		jest.spyOn(IdentityDocs, 'getIdentityKeys').mockImplementationOnce(async () => ServerIdentityKey);
		jest.spyOn(TrustedRootDb, 'addTrustedRootId').mockImplementationOnce(async () => null);
		jest.spyOn(VerifiableCredentialDb, 'getNextCredentialIndex').mockImplementationOnce(async () => 1);

		await keyGenerator.keyGeneration();

		const sub = {
			claim: ServerIdentityMock.userData.claim,
			credentialType: CredentialTypes.VerifiedIdentityCredential,
			id: ServerIdentityMock.userData.id
		};
		expect(issueCredentialSpy).toHaveBeenCalledWith(sub, ServerIdentityMock.doc.id, ServerIdentityMock.doc.id); // should run till end of setup
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
		jest.resetModules();
	});
});
