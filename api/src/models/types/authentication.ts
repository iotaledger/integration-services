import Express from 'express';
import { Static } from '@sinclair/typebox';
import { RevokeVerificationSchema, VerifyIdentitySchema } from '../schemas/authentication';
import { User } from './user';

export type VerifyIdentityBody = Static<typeof VerifyIdentitySchema>;
export type RevokeVerificationBody = Static<typeof RevokeVerificationSchema>;

export interface AuthenticatedRequest extends Express.Request {
	user: User;
}

export interface AuthorizationCheck {
	isAuthorized: boolean;
	error?: Error | null;
}
