import { Type, Static } from '@sinclair/typebox';

const VerificationSchema = Type.Object({
  verified: Type.Boolean(),
  verificationIssuerId: Type.Optional(Type.String()), // public-key
  verificationDate: Type.Optional(Type.String())
});

export const UserWithoutIdSchema = Type.Object({
  username: Type.String(),
  firstName: Type.Optional(Type.String()),
  lastName: Type.Optional(Type.String()),
  organization: Type.Optional(Type.String()),
  subscribedChannelIds: Type.Array(Type.String()),
  registrationDate: Type.Optional(Type.String()),
  verification: Type.Optional(VerificationSchema),
  classification: Type.String(),
  description: Type.Optional(Type.String())
});

export const UserSchema = Type.Object({
  userId: Type.String(), // did
  publicKey: Type.String()
});

export type UserWithoutId = Static<typeof UserWithoutIdSchema>;
export type User = Static<typeof UserSchema> & UserWithoutId;

export const enum UserClassification {
  'human' = 'human',
  'device' = 'device',
  'api' = 'api'
}

export interface UserSearch {
  username?: string;
  organization?: string;
  subscribedChannelIds?: string[];
  verified?: boolean;
  registrationDate?: Date;
  classification?: UserClassification;
  limit?: number;
  index?: number;
}

type OmittedUser = Omit<User, 'registrationDate' | 'classification' | 'verification'>;

export interface UserPersistence extends OmittedUser {
  verification?: VerificationPersistence;
  registrationDate?: Date;
  classification: UserClassification;
}

export interface VerificationPersistence {
  verified: boolean;
  verificationIssuerId?: string;
  verificationDate?: Date;
}
