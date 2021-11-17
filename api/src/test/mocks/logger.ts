import { ILogger } from '../../utils/logger';

export const LoggerMock: ILogger = {
	getExpressWinstonOptions: () => ({
		transports: [],
		headerBlacklist: ['Authorization', 'authorization', 'cookie'],
		level: 'info'
	}),
	log: (message: string) => {},
	error: (message: string) => {}
};
