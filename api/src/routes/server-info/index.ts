import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CONFIG } from '../../config';
import { ILogger } from '../../utils/logger';
import * as os from 'os';
import { ConfigurationService } from '../../services/configuration-service';

export class ServerInfoRoutes {
	constructor(private readonly logger: ILogger, private readonly configService: ConfigurationService) {}

	getServerInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const hostname = os.hostname();
			const commitHash = CONFIG.commitHash || 'not defined';
			const identityId = this.configService.serverIdentityId || 'not defined';
			const version = CONFIG.apiVersion || 'not defined';

			res.status(StatusCodes.OK).send({
				commitHash,
				hostname,
				identityId,
				version
			});
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not get server info'));
		}
	};
}
