import { Type } from '@sinclair/typebox';

export const ProveOwnershipPostBodySchema = Type.Object({
	signedNonce: Type.String({ minLength: 128, maxLength: 128 })
});

export const NounceSchema = Type.Object({
	nounce: Type.String({ minLength: 40, maxLength: 40 })
});