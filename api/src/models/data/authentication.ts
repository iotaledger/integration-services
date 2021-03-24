import Express from 'express';

export interface AuthenticatedRequest extends Express.Request {
	userId: string;
}

export interface AuthorizationCheck {
	isAuthorized: boolean;
	error?: Error | null;
}
