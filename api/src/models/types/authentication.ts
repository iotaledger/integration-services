import Express from 'express';
import { Static } from '@sinclair/typebox';
import { RevokeVerificationSchema, VerifyUserSchema } from '../schemas/authentication';
import { User } from './user';

export type VerifyUserBody = Static<typeof VerifyUserSchema>;
export type RevokeVerificationBody = Static<typeof RevokeVerificationSchema>;

export interface AuthenticatedRequest extends Express.Request {
	user: User;
}

export interface AuthorizationCheck {
	isAuthorized: boolean;
	error?: Error | null;
}
