import { Router } from 'express';
import { CONFIG } from '../../config';
import { CreateUserBodySchema, UpdateUserBodySchema } from '../../models/schemas/request-body/user-bodies';
import { UserSchema } from '../../models/schemas/user';
import { IdentityRoutes } from '../../routes/identity';
import { UserService } from '../../services/user-service';
import { Logger } from '../../utils/logger';
import { apiKeyMiddleware, authMiddleWare, authorizationService, ssiService, validate } from '../helper';

const { serverSecret } = CONFIG;
export const userService = new UserService(ssiService, serverSecret, Logger.getInstance());

const identityRoutes = new IdentityRoutes(userService, authorizationService, Logger.getInstance());
const { createIdentity, getUser, searchUsers, addUser, updateUser, deleteUser } = identityRoutes;

export const identityRouter = Router();
/**
 * @openapi
 * /identities/create:
 *   post:
 *     description: Create a new decentralized digital identity (DID). Identity DID document is signed and published to the ledger (IOTA Tangle). A digital identity can represent an individual, an organization or an object. The privateAuthKey controlling the identity is returned. It is recommended to securely (encrypt) store the privateAuthKey locally, since it is not stored on the APIs Bridge.
 *     tags:
 *     - identity
 *     requestBody:
 *       content: 
 *         application/json:
 *           schema: 
 *             $ref: "#/components/schemas/CreateIdentityBodySchema"
 *     responses:
 *       201:
 *         description: Returns the created identity
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/IdentityJsonUpdate"            
 */
identityRouter.post('/create', apiKeyMiddleware, validate({ body: CreateUserBodySchema }), createIdentity);

/**
 * @openapi
 * /identities/search:
 *   get:
 *     description: Search for identities in the system and returns a list of existing identities.
 *     tags:
 *     - identity
 *     responses:
 *       201:
 *         description: List of existing entities.
 *         content: 
 *           application/json:
 *             schema:
 *               AnyValue: {}
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string             
 */
identityRouter.get('/search', apiKeyMiddleware, authMiddleWare, searchUsers);

/**
 * @openapi
 * /identities/identity/{identityId}:
 *   get:
 *     description: Get information (including attached credentials) about a specific identity using the identity-id (DID identifier).
 *     tags:
 *     - identity
 *     parameters:
 *     - name: identityId
 *       in: path
 *       required: true
 *     responses:
 *       200:
 *         description: List of existing entities.
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:  
 *                  type: $ref: "#/components/schemas/User"  
 *                  nullable: true 
 * 
 */
identityRouter.get('/identity/:identityId', apiKeyMiddleware, getUser);
identityRouter.post('/identity', apiKeyMiddleware, validate({ body: UserSchema }), addUser);
identityRouter.put('/identity', apiKeyMiddleware, authMiddleWare, validate({ body: UpdateUserBodySchema }), updateUser);
identityRouter.delete('/identity/:identityId', apiKeyMiddleware, authMiddleWare, deleteUser);
