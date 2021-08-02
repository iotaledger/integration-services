import { Static } from "@sinclair/typebox";
import { SubscriptionSchema } from "../schemas/subscription";

export type Subscription  = Static<typeof SubscriptionSchema>
