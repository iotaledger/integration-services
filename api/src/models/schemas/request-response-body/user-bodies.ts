import { Type } from '@sinclair/typebox';
import { UserWithoutIdFields } from '../user';

export const CreateUserBodySchema = Type.Object({
	...UserWithoutIdFields
});

export const CreateIdentityBodySchema = Type.Object({
	storeIdentity: Type.Optional(Type.Boolean()),
	...UserWithoutIdFields
})

export const UpdateUserBodySchema = Type.Object({
	identityId: Type.String({ minLength: 50, maxLength: 53 }) // did
});
