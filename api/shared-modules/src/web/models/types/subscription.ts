import { Static } from '@sinclair/typebox';
import { SubscriptionSchema, SubscriptionUpdateSchema, SubscriptionStateSchema } from '../schemas/subscription';

export type Subscription = Static<typeof SubscriptionSchema>;
export type SubscriptionState = Static<typeof SubscriptionStateSchema>;
export type SubscriptionUpdate = Static<typeof SubscriptionUpdateSchema>;
