import { Type } from '@sinclair/typebox';
import { IdentityWithoutIdFields } from '../user';

export const CreateIdentityBodySchema = Type.Object({
	storeIdentity: Type.Optional(Type.Boolean()),
	...IdentityWithoutIdFields
});

export const UpdateIdentityBodySchema = Type.Object({
	id: Type.String({ minLength: 50, maxLength: 53 }) // did
});
