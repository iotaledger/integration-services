import { ConfigMock } from '../../test/mocks/config';
import { ConfigurationService } from '../configuration-service';
import { LoggerMock } from '../../test/mocks/logger';
import * as UserDb from '../../database/user';
import * as IdentityDocDB from '../../database/identity-docs';

describe('test configuration service', () => {
	let loggerSpy: jest.SpyInstance;
	beforeEach(() => {
		loggerSpy = jest.spyOn(LoggerMock, 'error');
	});

	it('should crash since env variables are missing', async () => {
		const start = () => ConfigurationService.getInstance(LoggerMock);
		expect(start).toThrowError('Server secret must to have a length of 32!');
	});

	it('should start without errors if all env vars are set', async () => {
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.DATABASE_URL = ConfigMock.databaseUrl;
		process.env.DATABASE_NAME = ConfigMock.databaseName;
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.API_VERSION = ConfigMock.apiVersion;
		process.env.IOTA_HORNET_NODE = ConfigMock.hornetNode;
		process.env.IOTA_PERMA_NODE = ConfigMock.permaNode;

		const start = () => ConfigurationService.getInstance(LoggerMock);
		expect(start).not.toThrow();
		expect(loggerSpy).not.toHaveBeenCalled();
	});

	it('should log that no server identity was found', async () => {
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.DATABASE_URL = ConfigMock.databaseUrl;
		process.env.DATABASE_NAME = ConfigMock.databaseName;
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.API_VERSION = ConfigMock.apiVersion;
		process.env.IOTA_HORNET_NODE = ConfigMock.hornetNode;
		process.env.IOTA_PERMA_NODE = ConfigMock.permaNode;

		const getServerIdentitiesSpy = jest.spyOn(UserDb, 'getServerIdentities').mockImplementation(async () => []);
		const getIdentityDocSpy = jest.spyOn(IdentityDocDB, 'getIdentityDoc').mockImplementation(async () => null);

		const configService = ConfigurationService.getInstance(LoggerMock);
		await configService.getRootIdentityId();

		expect(getServerIdentitiesSpy).toHaveBeenCalledWith();
		expect(getIdentityDocSpy).not.toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith('No root identity found!');
	});

	it('should log that no identity doc was found', async () => {
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.DATABASE_URL = ConfigMock.databaseUrl;
		process.env.DATABASE_NAME = ConfigMock.databaseName;
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.API_VERSION = ConfigMock.apiVersion;
		process.env.IOTA_HORNET_NODE = ConfigMock.hornetNode;
		process.env.IOTA_PERMA_NODE = ConfigMock.permaNode;

		const getServerIdentitiesSpy = jest
			.spyOn(UserDb, 'getServerIdentities')
			.mockImplementation(async () => [{ identityId: 'did:iota:1234', publicKey: 'testpublickey' }]);
		const getIdentityDocSpy = jest.spyOn(IdentityDocDB, 'getIdentityDoc').mockImplementation(async () => null);

		const configService = ConfigurationService.getInstance(LoggerMock);
		await configService.getRootIdentityId();

		expect(getServerIdentitiesSpy).toHaveBeenCalledWith();
		expect(getIdentityDocSpy).toHaveBeenCalledWith('did:iota:1234', ConfigMock.serverSecret);
		expect(loggerSpy).toHaveBeenCalledWith('Root identity document with id: did:iota:1234 not found in database!');
	});

	it('should log that found identity is malicious', async () => {
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.DATABASE_URL = ConfigMock.databaseUrl;
		process.env.DATABASE_NAME = ConfigMock.databaseName;
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.API_VERSION = ConfigMock.apiVersion;
		process.env.IOTA_HORNET_NODE = ConfigMock.hornetNode;
		process.env.IOTA_PERMA_NODE = ConfigMock.permaNode;

		const getServerIdentitiesSpy = jest
			.spyOn(UserDb, 'getServerIdentities')
			.mockImplementation(async () => [{ identityId: null, publicKey: 'testpublickey' }]); // no valid id
		const getIdentityDocSpy = jest.spyOn(IdentityDocDB, 'getIdentityDoc').mockImplementation(async () => null);

		const configService = ConfigurationService.getInstance(LoggerMock);
		await configService.getRootIdentityId();

		expect(getServerIdentitiesSpy).toHaveBeenCalledWith();
		expect(getIdentityDocSpy).not.toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith('Root identity id not found');
	});

	it('should log that two root identites were found', async () => {
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.DATABASE_URL = ConfigMock.databaseUrl;
		process.env.DATABASE_NAME = ConfigMock.databaseName;
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.API_VERSION = ConfigMock.apiVersion;
		process.env.IOTA_HORNET_NODE = ConfigMock.hornetNode;
		process.env.IOTA_PERMA_NODE = ConfigMock.permaNode;

		const getServerIdentitiesSpy = jest.spyOn(UserDb, 'getServerIdentities').mockImplementation(async () => [
			{ identityId: 'did:iota:1234', publicKey: 'testpublickey' },
			{ identityId: 'did:iota:123456', publicKey: 'testpublickey2' }
		]); // two root identities
		const getIdentityDocSpy = jest.spyOn(IdentityDocDB, 'getIdentityDoc').mockImplementation(async () => null);

		const configService = ConfigurationService.getInstance(LoggerMock);
		await configService.getRootIdentityId();

		expect(getServerIdentitiesSpy).toHaveBeenCalledWith();
		expect(getIdentityDocSpy).not.toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith('Database is in bad state: found 2 root identities');
	});

	it('should run sucessfully since document and root identity was found', async () => {
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.DATABASE_URL = ConfigMock.databaseUrl;
		process.env.DATABASE_NAME = ConfigMock.databaseName;
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.API_VERSION = ConfigMock.apiVersion;
		process.env.IOTA_HORNET_NODE = ConfigMock.hornetNode;
		process.env.IOTA_PERMA_NODE = ConfigMock.permaNode;

		const getServerIdentitiesSpy = jest
			.spyOn(UserDb, 'getServerIdentities')
			.mockImplementation(async () => [{ identityId: 'did:iota:1234', publicKey: 'testpublickey' }]);
		const getIdentityDocSpy = jest.spyOn(IdentityDocDB, 'getIdentityDoc').mockImplementation(async () => {
			return {} as any;
		});

		const configService = ConfigurationService.getInstance(LoggerMock);
		const id = await configService.getRootIdentityId();

		expect(getServerIdentitiesSpy).toHaveBeenCalledWith();
		expect(getIdentityDocSpy).toHaveBeenCalledWith('did:iota:1234', ConfigMock.serverSecret);
		expect(loggerSpy).not.toHaveBeenCalled();
		expect(id).toEqual('did:iota:1234');
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});
});
