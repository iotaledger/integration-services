import Express from 'express';
import { Static } from '@sinclair/typebox';
import { VerifyUserSchema } from '../schemas/authentication';
import { User } from './user';

export type VerifyUserBody = Static<typeof VerifyUserSchema>;

export interface AuthenticatedRequest extends Express.Request {
	user: User;
}

export interface AuthorizationCheck {
	isAuthorized: boolean;
	error?: Error | null;
}
