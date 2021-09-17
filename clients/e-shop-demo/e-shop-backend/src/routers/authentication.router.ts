import {Router} from 'express';
import { authenticate } from '../routes/authentication.route';

export const authenticationRouter = Router();

authenticationRouter.get('/authenticate/:identityId', authenticate);