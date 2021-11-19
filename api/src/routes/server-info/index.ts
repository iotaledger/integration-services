import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CONFIG } from "../../config";
import { SERVER_IDENTITY } from "../../config/server";
import { ILogger } from "../../utils/logger";
import * as os from "os";

export class ServerInfoRoutes {
    constructor(
        private readonly logger: ILogger
    ) {}

    getServerInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const hostname = os.hostname();
            const commitHash = CONFIG.commitHash || 'not defined';
            const identityId = SERVER_IDENTITY.serverIdentity || 'not defined';
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
    }
}