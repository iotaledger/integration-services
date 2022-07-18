import { Static } from '@sinclair/typebox';
import { IdentitySearchBodySchema } from '../schemas/request-response-body/identity-bodies';
import { ClaimSchema } from '../schemas/request-response-body/verification-bodies';
import { IdentitySchema } from '../schemas/user';
import { OrganizationSchema, ServiceSchema, PersonSchema, ProductSchema, DeviceSchema } from '../schemas/user-types';

export type IdentityClaim = Static<typeof ClaimSchema>;
export type User = Static<typeof IdentitySchema>;
export type UserSearchResponse = Static<typeof IdentitySearchBodySchema>;
export type Organization = Static<typeof OrganizationSchema>;
export type Service = Static<typeof ServiceSchema>;
export type Person = Static<typeof PersonSchema>;
export type Product = Static<typeof ProductSchema>;
export type Device = Static<typeof DeviceSchema>;

export enum UserType {
	Organization = 'Organization',
	Service = 'Service',
	Person = 'Person',
	Device = 'Device',
	Product = 'Product',
	Unknown = 'Unknown'
}

export enum UserRoles {
	Admin = 'Admin',
	Manager = 'Manager',
	User = 'User'
}

export interface UserSearch {
	username?: string;
	creator?: string;
	registrationDate?: Date;
	type?: UserType | string;
	limit?: number;
	index?: number;
	ascending?: boolean;
	hidden?: boolean
}

type OmittedUser = Omit<User, 'registrationDate' | 'role'>;

export interface UserPersistence extends OmittedUser {
	role?: UserRoles;
	registrationDate?: Date;
}
