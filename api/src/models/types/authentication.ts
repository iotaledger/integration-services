import Express from 'express';
import { Static } from '@sinclair/typebox';
import { VerifyUserSchema } from '../schemas/authentication';

export type VerifyUserBody = Static<typeof VerifyUserSchema>;

export interface AuthenticatedRequest extends Express.Request {
	userId: string;
}

export interface AuthorizationCheck {
	isAuthorized: boolean;
	error?: Error | null;
}
