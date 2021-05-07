import { DeviceSchema, OrganizationSchema, PersonSchema, ProductSchema, ServiceSchema } from '../../models/schemas/user-types';
import { User, UserType } from '../../models/types/user';
import Ajv from 'ajv';
const ajv = new Ajv();

export class Validator {
	private static instance: Validator;

	private constructor() {}

	public static getInstance(): Validator {
		if (!Validator.instance) {
			Validator.instance = new Validator();
		}
		return Validator.instance;
	}

	validateUser = (user: User) => {
		let validate: Ajv.ValidateFunction;

		switch (user.type) {
			case UserType.Person:
				validate = ajv.compile(PersonSchema);
				break;
			case UserType.Device:
				validate = ajv.compile(DeviceSchema);
				break;
			case UserType.Organization:
				validate = ajv.compile(OrganizationSchema);
				break;
			case UserType.Product:
				validate = ajv.compile(ProductSchema);
				break;
			case UserType.Service:
				validate = ajv.compile(ServiceSchema);
				break;

			default:
				break;
		}

		const validDetails = <boolean>validate(user.data);
		if (!validDetails) {
			throw new Error('no valid user data');
		}
	};
}
