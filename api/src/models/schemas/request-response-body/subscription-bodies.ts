import { Type } from "@sinclair/typebox";

export const RequestSubscriptionBodyResponseSchema = Type.Object({
    seed: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    subscriptionLink: Type.String()
});

export const AuthorizeSubscriptionBodyResponseSchema = Type.Object({
    keyloadLink: Type.String()
});