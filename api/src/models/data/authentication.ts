import Express from 'express';

export interface AuthenticatedRequest extends Express.Request {
	userId: string;
}
