import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CONFIG } from "../../config";
import { ILogger } from "../../utils/logger";

export class ServerInfoRoutes {
    constructor(
        private readonly logger: ILogger
    ) {}

    getServerInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const commitHash = CONFIG.commitHash || 'not defined';
            const identityId = CONFIG.serverIdentityId || 'not defined';
            const version = CONFIG.apiVersion || 'not defined';

            res.status(StatusCodes.OK).send({
                commitHash,
                identityId,
                version
            });
        } catch (error) {
            this.logger.error(error);
            next(new Error('could not get server info'));
        }
    }
}