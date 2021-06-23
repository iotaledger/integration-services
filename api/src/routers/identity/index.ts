import { Router } from 'express';
import { CONFIG } from '../../config';
import { CreateUserBodySchema, UpdateUserBodySchema } from '../../models/schemas/request-body/user-bodies';
import { UserSchema } from '../../models/schemas/user';
import { IdentityRoutes } from '../../routes/identity';
import { UserService } from '../../services/user-service';
import { apiKeyMiddleware, authMiddleWare, authorizationService, ssiService, validate } from '../helper';

const { serverSecret } = CONFIG;
export const userService = new UserService(ssiService, serverSecret);

const identityRoutes = new IdentityRoutes(userService, authorizationService);
const { createIdentity, getUser, searchUsers, addUser, updateUser, deleteUser } = identityRoutes;
export const identityRouter = Router();

identityRouter.post('/create', apiKeyMiddleware, validate({ body: CreateUserBodySchema }), createIdentity);
identityRouter.get('/search', apiKeyMiddleware, authMiddleWare, searchUsers);
identityRouter.get('/identity/:identityId', apiKeyMiddleware, getUser);
identityRouter.post('/identity', apiKeyMiddleware, validate({ body: UserSchema }), addUser);
identityRouter.put('/identity', apiKeyMiddleware, authMiddleWare, validate({ body: UpdateUserBodySchema }), updateUser);
identityRouter.delete('/identity/:identityId', apiKeyMiddleware, authMiddleWare, deleteUser);
