import { Organization, Person, Service, Device, Product, UserType } from '../../models/types/user';

export class JsonldGenerator {
	contexts: { [key: string]: string | string[] } = {
		Organization: 'https://schema.org/',
		Person: 'https://schema.org/',
		Product: 'https://schema.org/',
		Device: ['https://smartdatamodels.org/context.jsonld'],
		Service: 'https://schema.org/'
	};

	jsonldUserData = (userType: UserType, data: Person | Organization | Service | Device | Product) => {
		const context = this.contexts[userType];

		return {
			'@context': context,
			'@type': userType,
			type: userType === UserType.Device ? userType : undefined,
			...data
		};
	};
}
