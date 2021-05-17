import { Organization, Person, Service, Device, Product } from '../../models/types/user';

export class JsonldGenerator {
	contexts: { [key: string]: string | string[] } = {
		Organization: 'https://schema.org/',
		Person: 'https://schema.org/',
		Product: 'https://schema.org/',
		Device: ['https://smartdatamodels.org/context.jsonld'],
		Service: 'https://schema.org/'
	};

	jsonldUserData(userType: string, data: Person | Organization | Service | Device | Product) {
		const context = this.contexts[userType];
		if (!context) {
			return data;
		}
		return {
			'@context': context,
			...data
		};
	}
}
