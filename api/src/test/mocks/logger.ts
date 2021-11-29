import { ILogger } from '../../utils/logger';

export const LoggerMock: ILogger = {
	log: (message: string) => {},
	error: (message: string) => {}
};
