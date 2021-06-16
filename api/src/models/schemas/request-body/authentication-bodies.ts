import { Type } from '@sinclair/typebox';

export const ProveOwnershipPostBodySchema = Type.Object({
	signedNonce: Type.String({ minLength: 128, maxLength: 128 })
});
