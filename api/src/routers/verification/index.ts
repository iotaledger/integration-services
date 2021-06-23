import { Router } from 'express';
import { CONFIG } from '../../config';
import { KEY_COLLECTION_SIZE } from '../../config/identity';
import {
	RevokeVerificationBodySchema,
	VerifiableCredentialBodySchema,
	VerifyIdentityBodySchema
} from '../../models/schemas/request-body/verification-bodies';
import { VerificationRoutes } from '../../routes/verification';
import { VerificationService } from '../../services/verification-service';
import { apiKeyMiddleware, authMiddleWare, authorizationService, ssiService, validate } from '../helper';
import { userService } from '../identity';

const { serverSecret, serverIdentityId } = CONFIG;

const verificationService = new VerificationService(ssiService, userService, {
	serverIdentityId,
	serverSecret,
	keyCollectionSize: KEY_COLLECTION_SIZE
});
const verificationRoutes = new VerificationRoutes(verificationService, authorizationService, CONFIG);
const {
	createVerifiableCredential,
	checkVerifiableCredential,
	revokeVerifiableCredential,
	getLatestDocument,
	getTrustedRootIdentities
} = verificationRoutes;

export const verificationRouter = Router();
verificationRouter.get('/latest-document/:identityId', apiKeyMiddleware, getLatestDocument);
verificationRouter.get('/trusted-roots', apiKeyMiddleware, getTrustedRootIdentities);
verificationRouter.post(
	'/create-credential',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: VerifyIdentityBodySchema }),
	createVerifiableCredential
);
verificationRouter.post('/check-credential', apiKeyMiddleware, validate({ body: VerifiableCredentialBodySchema }), checkVerifiableCredential);
verificationRouter.post(
	'/revoke-credential',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: RevokeVerificationBodySchema }),
	revokeVerifiableCredential
);
