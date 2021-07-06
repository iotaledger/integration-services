import { Type } from "@sinclair/typebox";

export const ErrorResponseSchema = Type.Object({
	error: Type.String()
});

export const IdentityIdSchema = Type.String({ minLength: 50, maxLength: 53 });
	