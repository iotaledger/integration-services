import { ConfigMock } from '../../test/mocks/config';
import { ConfigurationService } from '../configuration-service';
import { LoggerMock } from '../../test/mocks/logger';

describe('test configuration service', () => {
	let loggerSpy: jest.SpyInstance;
	beforeEach(() => {
		loggerSpy = jest.spyOn(LoggerMock, 'error');
	});

	it('should crash since env variables are missing', async () => {
		const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { return undefined as never });
		ConfigurationService.getInstance(LoggerMock);
		expect(mockExit).toHaveBeenCalledWith(1);
	});

	it('should start without errors if all env vars are set', async () => {
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.JWT_SECRET = ConfigMock.jwtSecret;
		process.env.DATABASE_URL = ConfigMock.databaseUrl;
		process.env.DATABASE_NAME = ConfigMock.databaseName;
		process.env.SERVER_SECRET = ConfigMock.serverSecret;
		process.env.IOTA_HORNET_NODE = ConfigMock.hornetNode;
		process.env.IOTA_PERMA_NODE = ConfigMock.permaNode;

		const start = () => ConfigurationService.getInstance(LoggerMock);
		expect(start).not.toThrow();
		expect(loggerSpy).not.toHaveBeenCalled();
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});
});
