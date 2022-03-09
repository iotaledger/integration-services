export interface Item {
	// id and imageUrl are optional because 'No items' placeholder does not have any of those properties
	id?: number;
	name: string;
	imageUrl?: string;
	price: number;
	ageRestricted: boolean;
}
