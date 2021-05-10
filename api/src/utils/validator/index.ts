import { DeviceSchema, OrganizationSchema, PersonSchema, ProductSchema, ServiceSchema } from '../../models/schemas/user-types';
import { User, UserType } from '../../models/types/user';
import Ajv from 'ajv';

export class Validator {
	private static instance: Validator;
	private static ajv: Ajv.Ajv;

	private constructor() {
		Validator.ajv = new Ajv();
		Validator.ajv.addSchema(PersonSchema, 'person');
		Validator.ajv.addSchema(DeviceSchema, 'device');
		Validator.ajv.addSchema(OrganizationSchema, 'organization');
		Validator.ajv.addSchema(ProductSchema, 'product');
		Validator.ajv.addSchema(ServiceSchema, 'service');
	}

	public static getInstance(): Validator {
		if (!Validator.instance) {
			Validator.instance = new Validator();
		}
		return Validator.instance;
	}

	compileSchemas() {}

	validateUser = (user: User) => {
		let validate: Ajv.ValidateFunction;

		switch (user.type) {
			case UserType.Person:
				validate = Validator.ajv.getSchema('person');
				break;
			case UserType.Device:
				validate = Validator.ajv.getSchema('device');
				break;
			case UserType.Organization:
				validate = Validator.ajv.getSchema('organization');
				break;
			case UserType.Product:
				validate = Validator.ajv.getSchema('product');
				break;
			case UserType.Service:
				validate = Validator.ajv.getSchema('service');
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
