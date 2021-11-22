import { ConfigMock } from '../../test/mocks/config';
import { ConfigurationService } from '../configuration-service';
import { LoggerMock } from '../../test/mocks/logger';

describe('test configuration service', () => {
	beforeEach(() => {});

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

		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const start = () => ConfigurationService.getInstance(LoggerMock);
		expect(start).not.toThrow();
		expect(loggerSpy).not.toHaveBeenCalled();
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});
});
