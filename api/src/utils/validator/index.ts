import {
	DeviceSchema,
	OrganizationSchema,
	PersonSchema,
	ProductSchema,
	ServiceSchema
} from '@iota-is/shared-modules/src/models/schemas/user-types';
import { User, UserType } from '@iota-is/shared-modules/src/models/types/user';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { ILogger } from '../logger';

export class SchemaValidator {
	private static instance: SchemaValidator;
	private ajv: Ajv;

	private constructor(private readonly logger: ILogger) {
		this.ajv = new Ajv({ strict: false });
		addFormats(this.ajv);

		this.addSchemas();
	}

	public static getInstance(logger: ILogger): SchemaValidator {
		if (!SchemaValidator.instance) {
			SchemaValidator.instance = new SchemaValidator(logger);
		}
		return SchemaValidator.instance;
	}

	validateUser(user: User) {
		let validate: ValidateFunction;

		switch (user.claim?.type) {
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
		if (!validate) {
			this.logger.log(`no schema found for user type: ${user.claim?.type}`);
			return;
		}

		if (user.claim) {
			const validDetails = <boolean>validate(user.claim);
			if (!validDetails) {
				throw new Error('no valid identity claim');
			}
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
