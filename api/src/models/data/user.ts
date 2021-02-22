import { Type, Static } from '@sinclair/typebox';

const VerificationSchema = Type.Object({
  verified: Type.Boolean(),
  verificationIssuerId: Type.Optional(Type.String()), // public-key
  verificationDate: Type.Optional(Type.String())
});

export const UserSchema = Type.Object({
  userId: Type.String(), // public-key
  username: Type.Optional(Type.String()),
  firstName: Type.Optional(Type.String()),
  lastName: Type.Optional(Type.String()),
  organization: Type.Optional(Type.String()),
  subscribedChannelIds: Type.Array(Type.String()),
  registrationDate: Type.Optional(Type.String()),
  verification: Type.Optional(VerificationSchema),
  classification: Type.String(),
  description: Type.Optional(Type.String())
});

export type UserDto = Static<typeof UserSchema>;

export const enum UserClassification {
  'human' = 'human',
  'device' = 'device',
  'api' = 'api'
}

type OmitedUserDto = Omit<UserDto, 'registrationDate' | 'classification' | 'verification'>;

export interface User extends OmitedUserDto {
  verification?: Verification;
  registrationDate?: Date;
  classification: UserClassification;
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

export interface Verification {
  verified: boolean;
  verificationIssuerId?: string; // public-key
  verificationDate?: Date;
}
