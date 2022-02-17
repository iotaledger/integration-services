import { Router } from 'express';
import { ServerInfoRoutes } from '../../routes/server-info';
import { Logger } from '@iota/is-shared-modules/lib/utils/logger';
import { ConfigurationService } from '../../services/configuration-service';

const serverInfoRoutes = new ServerInfoRoutes(Logger.getInstance(), ConfigurationService.getInstance(Logger.getInstance()));
const { getServerInfo } = serverInfoRoutes;
export const serverInfoRouter = Router();

/**
 * @openapi
 * /info:
 *   get:
 *     summary: Get information about the server
 *     description: Get information about the server like commitHash, server identity id and api version
 *     tags:
 *     - server-info
 *     servers:
 *       - url: /
 *     responses:
 *       200:
 *         description: Returns information about the server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 commitHash:
 *                   type: string
 *                 id:
 *                   type: string
 *                 version:
 *                   type: string
 *               required:
 *                 - commitHash
 *                 - id
 *                 - version
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
serverInfoRouter.get('/info', getServerInfo);
