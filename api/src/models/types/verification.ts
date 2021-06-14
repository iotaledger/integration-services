import Express from 'express';
import { User } from './user';

export interface AuthenticatedRequest extends Express.Request {
	user: User;
}

export interface AuthorizationCheck {
	isAuthorized: boolean;
	error?: Error | null;
}
