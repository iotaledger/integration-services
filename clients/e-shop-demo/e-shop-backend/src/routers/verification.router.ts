import { Router } from 'express';
import { verifyCredential } from '../routes/verification.route';

export const verificationRouter = Router();

verificationRouter.post('/check-credential', verifyCredential);
