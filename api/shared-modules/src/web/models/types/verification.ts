import { Static } from '@sinclair/typebox';
import Express from 'express';
import { VerifiableCredentialSchema } from '../schemas/identity';
import { SubjectBodySchema } from '../schemas/request-response-body/verification-bodies';
import { User } from './user';

export enum CredentialTypes {
	'VerifiedIdentityCredential' = 'VerifiedIdentityCredential',
	'BasicIdentityCredential' = 'BasicIdentityCredential'
}

export type Subject = Static<typeof SubjectBodySchema>;

export interface AuthenticatedRequest extends Express.Request {
	user: User;
}

export interface AuthorizationCheck {
	isAuthorized: boolean;
	error?: Error | null;
}
