import { Type } from '@sinclair/typebox';
import { IdentityDocumentJsonSchema } from '../identity';
import { IdentityWithoutIdAndCredentialFields, IdentityWithoutIdFields } from '../user';

export const CreateIdentityBodySchema = Type.Object({
	storeIdentity: Type.Optional(Type.Boolean()),
	...IdentityWithoutIdFields
});

export const UpdateIdentityBodySchema = Type.Object({
	id: Type.String({ minLength: 50, maxLength: 53 }) // did
});

export const IdentitySearchBodySchema = Type.Object({
	id: Type.String({ minLength: 50, maxLength: 53 }), // did
	publicKey: Type.String({ minLength: 10 }),
	creator: Type.Optional(Type.String({ minLength: 50, maxLength: 53 })),
	numberOfCredentials: Type.Integer({ description: 'Number of credentials connected to this identity' }),
	...IdentityWithoutIdAndCredentialFields
});

export const LatestIdentityDocSchema = Type.Object({
	document: IdentityDocumentJsonSchema,
	messageId: Type.String()
});
