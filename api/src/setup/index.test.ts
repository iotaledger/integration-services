import { KeyGenerator } from '.';
import { ConfigurationServiceMock } from '../test/mocks/service-mocks';
import { LoggerMock } from '../test/mocks/logger';
import * as UserDb from '../database/user';
import * as IdentityDocs from '../database/identity-docs';
import { ServerIdentityMock } from '../test/mocks/identities';

describe('test keygenerator', () => {
	let keyGenerator: KeyGenerator;
	beforeEach(() => {
		keyGenerator = new KeyGenerator(ConfigurationServiceMock, LoggerMock);
	});

	it('should throw error since found two serverIdentities', async () => {
		// found two server identities and so it throws an error
		const getServerIdentitiesSpy = jest.spyOn(UserDb, 'getServerIdentities').mockImplementationOnce(async () => [
			{ identityId: 'did:iota:1234', publicKey: 'testpublickey' },
			{ identityId: 'did:iota:123456789', publicKey: 'testpublickey2' }
		]);

		await expect(keyGenerator.keyGeneration()).rejects.toThrow('Database is in bad state: found 2 root identities');
		expect(getServerIdentitiesSpy).toHaveBeenCalled();
	});

	it('should return and log error since already found a serverIdentity but no document for it', async () => {
		// found one server identity but malicious format
		const getServerIdentitiesSpy = jest
			.spyOn(UserDb, 'getServerIdentities')
			.mockImplementationOnce(async () => [{ identityId: 'did:iota:1234', publicKey: 'testpublickey' }]);
		const getIdentityDocSpy = jest.spyOn(IdentityDocs, 'getIdentityDoc').mockImplementationOnce(async () => null);
		const loggerSpy = jest.spyOn(LoggerMock, 'error').mockImplementationOnce(() => null);

		await keyGenerator.keyGeneration();

		expect(getServerIdentitiesSpy).toHaveBeenCalled();
		expect(getIdentityDocSpy).toHaveBeenCalledWith('did:iota:1234', 'veryvery-very-very-server-secret');
		expect(loggerSpy).toHaveBeenCalledWith('Root identity already exists: verify data');
		expect(loggerSpy).toHaveBeenCalledWith('Error getting data from db');
	});

	it('should find a valid serveridentity doc', async () => {
		// found one server identity but malicious format
		const getServerIdentitiesSpy = jest
			.spyOn(UserDb, 'getServerIdentities')
			.mockImplementation(async () => [
				{ identityId: ServerIdentityMock.doc.id, publicKey: ServerIdentityMock.doc.authentication[0].publicKeyBase58 }
			]);
		const getIdentityDocSpy = jest.spyOn(IdentityDocs, 'getIdentityDoc').mockImplementationOnce(async () => ServerIdentityMock);
		const loggerErrorSpy = jest.spyOn(LoggerMock, 'error').mockImplementationOnce(() => null);
		const loggerInfoSpy = jest.spyOn(LoggerMock, 'log').mockImplementationOnce(() => null);

		await keyGenerator.keyGeneration();

		expect(getServerIdentitiesSpy).toHaveBeenCalled();
		expect(getIdentityDocSpy).toHaveBeenCalledWith(
			'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
			'veryvery-very-very-server-secret'
		);
		expect(loggerErrorSpy).toHaveBeenCalledWith('Root identity already exists: verify data');
		expect(loggerInfoSpy).toHaveBeenCalledWith('Setting root identity please wait...');
		expect(loggerInfoSpy).toHaveBeenCalledWith('Verify if root identity already exists...');
		expect(loggerInfoSpy).toHaveBeenCalledWith('Root identity is already defined and valid');
	});

	it('should find an invalid serveridentity doc because public and secret key are not compatible', async () => {
		let unvalidServerIdentity = { ...ServerIdentityMock };
		unvalidServerIdentity.key.public = 'wrongpublickey'; // found identity has wrong server keypair stored
		const getServerIdentitiesSpy = jest
			.spyOn(UserDb, 'getServerIdentities')
			.mockImplementationOnce(async () => [
				{ identityId: ServerIdentityMock.doc.id, publicKey: ServerIdentityMock.doc.authentication[0].publicKeyBase58 }
			]);
		const getIdentityDocSpy = jest.spyOn(IdentityDocs, 'getIdentityDoc').mockImplementationOnce(async () => unvalidServerIdentity);
		const loggerErrorSpy = jest.spyOn(LoggerMock, 'error').mockImplementationOnce(() => null);

		await keyGenerator.keyGeneration();

		expect(getServerIdentitiesSpy).toHaveBeenCalled();
		expect(getIdentityDocSpy).toHaveBeenCalledWith(
			'did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ',
			'veryvery-very-very-server-secret'
		);
		expect(loggerErrorSpy).toHaveBeenCalledWith('Root identity already exists: verify data');
		expect(loggerErrorSpy).toHaveBeenCalledWith('error when signing or verifying the nonce, the secret key might have changed...');
		expect(loggerErrorSpy).toHaveBeenCalledWith('Root identity malformed or not valid: ' + unvalidServerIdentity.doc.id);
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
		jest.resetModules();
	});
});
