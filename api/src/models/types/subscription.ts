import { Static } from '@sinclair/typebox';
import { SubscriptionSchema, SubscriptionUpdateSchema } from '../schemas/subscription';

export type Subscription = Static<typeof SubscriptionSchema>;

export type SubscriptionUpdate = Static<typeof SubscriptionUpdateSchema>;
