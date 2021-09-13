import { Router } from 'express';
import { ServerInfoRoutes } from '../../routes/server-info';
import { Logger } from '../../utils/logger';
import { apiKeyMiddleware } from '../middlewares';

const serverInfoRoutes = new ServerInfoRoutes(Logger.getInstance());
const { getServerInfo } = serverInfoRoutes;
export const serverInfoRouter = Router();

serverInfoRouter.get('/info', apiKeyMiddleware, getServerInfo);
