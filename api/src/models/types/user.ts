import { Static } from '@sinclair/typebox';
import { UserSchema } from '../schemas/user';
import { OrganizationSchema, ServiceSchema, PersonSchema, ProductSchema, DeviceSchema } from '../schemas/user-types';

export type User = Static<typeof UserSchema>;
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
	organization?: string;
	registrationDate?: Date;
	type?: UserType | string;
	limit?: number;
	index?: number;
}

type OmittedUser = Omit<User, 'registrationDate' | 'verification' | 'role'>;

export interface UserPersistence extends OmittedUser {
	role?: UserRoles;
	registrationDate?: Date;
}
