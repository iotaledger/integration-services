import { ConfigMock } from '../../test/mocks/config';
import { ConfigurationService } from '../configuration-service';
import { LoggerMock } from '../../test/mocks/logger';
import * as UserDb from '../../database/user';
import * as IdentityDocDB from '../../database/identity-keys';

describe('test configuration service', () => {
	let loggerSpy: jest.SpyInstance;
	let mockExit: jest.SpyInstance;
	beforeEach(() => {
		loggerSpy = jest.spyOn(LoggerMock, 'error');
		jest.spyOn(ConfigurationService, 'getInstance').mockImplementation(() => {
			return new ConfigurationService(LoggerMock);
		});
		mockExit  = jest.spyOn(process, 'exit').mockImplementation(() => {
			return undefined as never;
		});
	});

	it('should crash since env variables are missing', async () => {
		ConfigurationService.getInstance(LoggerMock);
		expect(loggerSpy).toHaveBeenCalledWith('SERVER_SECRET and JWT_SECRET must have a length of 32!');
		expect(mockExit).toHaveBeenCalledWith(1);
	});

	it('should crash since DATABASE_URL is missing', async () => {
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.JWT_SECRET = ConfigMock.jwtSecret;
		process.env.DATABASE_NAME = ConfigMock.databaseName;
		process.env.IOTA_HORNET_NODE = ConfigMock.hornetNode;
		process.env.IOTA_PERMA_NODE = ConfigMock.permaNode;
		
		ConfigurationService.getInstance(LoggerMock);
		expect(loggerSpy).toHaveBeenCalledWith('Env var is missing or invalid: databaseUrl');
		expect(mockExit).toHaveBeenCalledWith(1);
	});

	it('should start without errors if all env vars are set', async () => {
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.JWT_SECRET = ConfigMock.jwtSecret;
		process.env.DATABASE_URL = ConfigMock.databaseUrl;
		process.env.DATABASE_NAME = ConfigMock.databaseName;
		process.env.IOTA_HORNET_NODE = ConfigMock.hornetNode;
		process.env.IOTA_PERMA_NODE = ConfigMock.permaNode;

		ConfigurationService.getInstance(LoggerMock);
		expect(loggerSpy).not.toHaveBeenCalled();
		expect(mockExit).not.toHaveBeenCalled();
	});

	it('should log that no server identity was found', async () => {
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.JWT_SECRET = ConfigMock.jwtSecret;
		process.env.DATABASE_URL = ConfigMock.databaseUrl;
		process.env.DATABASE_NAME = ConfigMock.databaseName;
		process.env.IOTA_HORNET_NODE = ConfigMock.hornetNode;
		process.env.IOTA_PERMA_NODE = ConfigMock.permaNode;

		const getServerIdentitiesSpy = jest.spyOn(UserDb, 'getServerIdentities').mockImplementation(async () => []);
		const getIdentityKeysSpy = jest.spyOn(IdentityDocDB, 'getIdentityKeys').mockImplementation(async () => null);

		const configService = ConfigurationService.getInstance(LoggerMock);
		await configService.getRootIdentityId();

		expect(getServerIdentitiesSpy).toHaveBeenCalledWith();
		expect(getIdentityKeysSpy).not.toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith('No root identity found!');
	});

	it('should log that no identity doc was found', async () => {
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.JWT_SECRET = ConfigMock.jwtSecret;
		process.env.DATABASE_URL = ConfigMock.databaseUrl;
		process.env.DATABASE_NAME = ConfigMock.databaseName;
		process.env.IOTA_HORNET_NODE = ConfigMock.hornetNode;
		process.env.IOTA_PERMA_NODE = ConfigMock.permaNode;

		const getServerIdentitiesSpy = jest
			.spyOn(UserDb, 'getServerIdentities')
			.mockImplementation(async () => [{ id: 'did:iota:1234', username: 'test-user', publicKey: 'testpublickey' }]);
		const getIdentityKeysSpy = jest.spyOn(IdentityDocDB, 'getIdentityKeys').mockImplementation(async () => null);

		const configService = ConfigurationService.getInstance(LoggerMock);
		await configService.getRootIdentityId();

		expect(getServerIdentitiesSpy).toHaveBeenCalledWith();
		expect(getIdentityKeysSpy).toHaveBeenCalledWith('did:iota:1234', ConfigMock.serverSecret);
		expect(loggerSpy).toHaveBeenCalledWith('Root identity document with id: did:iota:1234 not found in database!');
	});

	it('should log that found identity is malicious', async () => {
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.JWT_SECRET = ConfigMock.jwtSecret;
		process.env.DATABASE_URL = ConfigMock.databaseUrl;
		process.env.DATABASE_NAME = ConfigMock.databaseName;
		process.env.IOTA_HORNET_NODE = ConfigMock.hornetNode;
		process.env.IOTA_PERMA_NODE = ConfigMock.permaNode;

		const getServerIdentitiesSpy = jest
			.spyOn(UserDb, 'getServerIdentities')
			.mockImplementation(async () => [{ id: null, username: 'test-user', publicKey: 'testpublickey' }]); // no valid id
		const getIdentityKeysSpy = jest.spyOn(IdentityDocDB, 'getIdentityKeys').mockImplementation(async () => null);

		const configService = ConfigurationService.getInstance(LoggerMock);
		await configService.getRootIdentityId();

		expect(getServerIdentitiesSpy).toHaveBeenCalledWith();
		expect(getIdentityKeysSpy).not.toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith('Root identity id not found');
	});

	it('should log that two root identites were found', async () => {
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.JWT_SECRET = ConfigMock.jwtSecret;
		process.env.DATABASE_URL = ConfigMock.databaseUrl;
		process.env.DATABASE_NAME = ConfigMock.databaseName;
		process.env.IOTA_HORNET_NODE = ConfigMock.hornetNode;
		process.env.IOTA_PERMA_NODE = ConfigMock.permaNode;

		const getServerIdentitiesSpy = jest.spyOn(UserDb, 'getServerIdentities').mockImplementation(async () => [
			{ id: 'did:iota:1234', username: 'test-user', publicKey: 'testpublickey' },
			{ id: 'did:iota:123456', username: 'test-user', publicKey: 'testpublickey2' }
		]); // two root identities
		const getIdentityKeysSpy = jest.spyOn(IdentityDocDB, 'getIdentityKeys').mockImplementation(async () => null);

		const configService = ConfigurationService.getInstance(LoggerMock);
		await configService.getRootIdentityId();

		expect(getServerIdentitiesSpy).toHaveBeenCalledWith();
		expect(getIdentityKeysSpy).not.toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith('Database is in bad state: found 2 root identities');
	});

	it('should run sucessfully since document and root identity was found', async () => {
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.JWT_SECRET = ConfigMock.jwtSecret;
		process.env.DATABASE_URL = ConfigMock.databaseUrl;
		process.env.DATABASE_NAME = ConfigMock.databaseName;
		process.env.IOTA_HORNET_NODE = ConfigMock.hornetNode;
		process.env.IOTA_PERMA_NODE = ConfigMock.permaNode;
		
		const getServerIdentitiesSpy = jest
			.spyOn(UserDb, 'getServerIdentities')
			.mockImplementation(async () => [{ id: 'did:iota:1234', username: 'test-user', publicKey: 'testpublickey' }]);
		const getIdentityKeysSpy = jest.spyOn(IdentityDocDB, 'getIdentityKeys').mockImplementation(async () => {
			return {} as any;
		});

		const configService = ConfigurationService.getInstance(LoggerMock);
		const id = await configService.getRootIdentityId();

		expect(getServerIdentitiesSpy).toHaveBeenCalledWith();
		expect(getIdentityKeysSpy).toHaveBeenCalledWith('did:iota:1234', ConfigMock.serverSecret);
		expect(loggerSpy).not.toHaveBeenCalled();
		expect(mockExit).not.toHaveBeenCalled();
		expect(id).toEqual('did:iota:1234');
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});
});
