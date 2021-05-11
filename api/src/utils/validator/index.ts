import { DeviceSchema, OrganizationSchema, PersonSchema, ProductSchema, ServiceSchema } from '../../models/schemas/user-types';
import { User, UserType } from '../../models/types/user';
import Ajv from 'ajv';

export class SchemaValidator {
	private static instance: SchemaValidator;
	private ajv: Ajv.Ajv;

	private constructor() {
		this.ajv = new Ajv();
		this.addSchemas();
	}

	public static getInstance(): SchemaValidator {
		if (!SchemaValidator.instance) {
			SchemaValidator.instance = new SchemaValidator();
		}
		return SchemaValidator.instance;
	}

	validateUser(user: User) {
		let validate: Ajv.ValidateFunction;

		switch (user.type) {
			case UserType.Person:
				validate = this.ajv.getSchema('person');
				break;
			case UserType.Device:
				validate = this.ajv.getSchema('device');
				break;
			case UserType.Organization:
				validate = this.ajv.getSchema('organization');
				break;
			case UserType.Product:
				validate = this.ajv.getSchema('product');
				break;
			case UserType.Service:
				validate = this.ajv.getSchema('service');
				break;
			default:
				break;
		}

		const validDetails = <boolean>validate(user.data);
		if (!validDetails) {
			throw new Error('no valid user data');
		}
	}

	private addSchemas() {
		this.ajv.addSchema(PersonSchema, 'person');
		this.ajv.addSchema(DeviceSchema, 'device');
		this.ajv.addSchema(OrganizationSchema, 'organization');
		this.ajv.addSchema(ProductSchema, 'product');
		this.ajv.addSchema(ServiceSchema, 'service');
	}
}
