import { Type } from '@sinclair/typebox';

// https://github.com/smart-data-models/dataModel.Device/blob/master/DeviceModel/doc/spec.md
// export const DeviceSchema = Type.Object({
// 	brandName: Type.String({ minLength: 1 }),
// 	category: Type.Array(Type.String({ minLength: 1 })),
// 	manufacturerName: Type.String({ minLength: 1 }),
// 	name: Type.String({ minLength: 1 }),
// 	type: Type.String({ minLength: 1 }),
// 	function: Type.Array(Type.String({ minLength: 1 })),
// 	controlledProperty: Type.Array(Type.String({ minLength: 1 })),
// 	encoding: Type.Optional(Type.String({ minLength: 1 })),

// 	// ??
// 	location: Type.Object(Type.Any()) // { lat:number, long:number }
// });

// export const ProductSchema = Type.Object({
// 	brandName: Type.String({ minLength: 1 }),
// 	category: Type.Array(Type.String({ minLength: 1 })),
// 	manufacturerName: Type.String({ minLength: 1 }),
// 	name: Type.String({ minLength: 1 }),
// 	type: Type.String({ minLength: 1 }),

// 	weight: Type.Number(),
// 	limitation: Type.Optional(Type.Number()),
// 	price: Type.Optional(Type.Number()),

// 	// ??
// 	size: Type.Object(Type.Any()), // { width:number, heigth:number, depth:number }
// 	packagingSize: Type.Object(Type.Any()) // { width:number, heigth:number, depth:number }
// });

export const ThingObject = {
	'@context': Type.Optional(Type.String({ minLength: 1 })),
	'@type': Type.String({ minLength: 1 }),
	name: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	url: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	image: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String()), Type.Null()])),
	sameAs: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()]))
};

export const ThingSchema = Type.Object({
	...ThingObject
});

export const QuantitativeValueSchema = Type.Object({
	...ThingObject,
	maxValue: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
	minValue: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
	unitCode: Type.Optional(Type.Union([Type.String(), Type.Number(), Type.Null()])),
	value: Type.Optional(Type.Union([Type.String(), Type.Number(), Type.Any(), Type.Null()]))
});

export const DistanceSchema = Type.Object({
	...ThingObject
});

export const AddressSchema = Type.Object({
	...ThingObject,
	addressCountry: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	addressLocality: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	addressRegion: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	postalCode: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	streetAddress: Type.Optional(Type.Union([Type.String(), Type.Null()]))
});

export const BrandSchema = Type.Object({
	...ThingObject,
	slogan: Type.Optional(Type.Union([Type.String(), Type.Null()]))
});

export const OfferSchema = Type.Object({
	...ThingObject,
	material: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	price: Type.Optional(Type.Union([Type.String(), Type.Number(), Type.Null()])),
	priceCurrency: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	priceValidUntil: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	itemCondition: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	availability: Type.Optional(Type.Union([Type.String(), Type.Null()]))
});

export const AggregateRatingSchema = Type.Object({
	...ThingObject,
	bestRating: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	ratingValue: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	reviewCount: Type.Optional(Type.Union([Type.String(), Type.Null()]))
});

export const ReviewRatingSchema = Type.Object({
	...ThingObject,
	ratingValue: Type.Optional(Type.Union([Type.String(), Type.Number(), Type.Null()])),
	bestRating: Type.Optional(Type.Union([Type.String(), Type.Number(), Type.Null()])),
	worstRating: Type.Optional(Type.Union([Type.String(), Type.Number(), Type.Null()]))
});

export const OrganizationSchema = Type.Object({
	...ThingObject,
	brand: Type.Optional(Type.Union([BrandSchema, Type.String(), Type.Null()])),
	address: Type.Optional(Type.Union([AddressSchema, Type.String(), Type.Any(), Type.Null()])),
	email: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	faxNumber: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	location: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	slogan: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	taxID: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	telephone: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	vatID: Type.Optional(Type.Union([Type.String(), Type.Null()]))
});

export const PersonSchema = Type.Object({
	...ThingObject,
	familyName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	givenName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	memberOf: Type.Optional(Type.Union([Type.Array(OrganizationSchema), OrganizationSchema, Type.String(), Type.Null()])),
	worksFor: Type.Optional(Type.Union([Type.Array(OrganizationSchema), OrganizationSchema, Type.String(), Type.Null()])),
	address: Type.Optional(Type.Union([AddressSchema, Type.String(), Type.Null()])),
	colleague: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
	email: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	jobTitle: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	birthPlace: Type.Optional(Type.Union([Type.String(), Type.Any(), Type.Null()])),
	birthDate: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	height: Type.Optional(Type.Union([DistanceSchema, QuantitativeValueSchema, Type.Null()])),
	weight: Type.Optional(Type.Union([QuantitativeValueSchema, Type.Null()])),
	gender: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	nationality: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	telephone: Type.Optional(Type.Union([Type.String(), Type.Null()]))
});

export const ReviewSchema = Type.Object({
	...ThingObject,
	reviewRating: ReviewRatingSchema,
	datePublished: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	reviewBody: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	author: Type.Optional(Type.Union([PersonSchema, Type.String(), Type.Null()]))
});

export const ProductSchema = Type.Object({
	...ThingObject,
	image: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
	sku: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	size: Type.Optional(Type.Union([Type.String(), DistanceSchema, QuantitativeValueSchema, Type.Any(), Type.Null()])),
	slogan: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	productID: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	productionDate: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	purchaseDate: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	releaseDate: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	color: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	category: Type.Optional(Type.Union([Type.String(), Type.Any(), Type.Null()])),
	gtin: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	nsn: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	width: Type.Optional(Type.Union([DistanceSchema, QuantitativeValueSchema, Type.Null()])),
	weight: Type.Optional(Type.Union([QuantitativeValueSchema, Type.Null()])),
	height: Type.Optional(Type.Union([DistanceSchema, QuantitativeValueSchema, Type.Null()])),
	alternateName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	mpn: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	material: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	brand: Type.Optional(Type.Union([BrandSchema, Type.String(), Type.Null()])),
	review: ReviewSchema,
	aggregateRating: Type.Optional(Type.Union([AggregateRatingSchema, Type.Null()])),
	offers: Type.Optional(Type.Union([Type.Array(OfferSchema), Type.Null()]))
});

export const ServiceSchema = Type.Object({
	...ThingObject,
	brand: Type.Optional(Type.Union([BrandSchema, OrganizationSchema, Type.Null()])),
	category: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	offers: Type.Optional(Type.Union([Type.Array(OfferSchema), Type.Null()])),
	provider: Type.Optional(Type.Union([OrganizationSchema, PersonSchema, Type.Null()])),
	review: Type.Optional(Type.Union([ReviewSchema, PersonSchema, Type.Null()])),
	serviceOutput: Type.Optional(Type.Union([ThingSchema, Type.Null()])),
	termsOfService: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	serviceType: Type.Optional(Type.Union([Type.String(), Type.Null()]))
});

export const DeviceCategorySchema = Type.Object({});
export const StructuredValueSchema = Type.Object({ ...ThingObject });

export const DeviceSchema = Type.Object({
	batteryLevel: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
	category: Type.Any(), // todo use enum
	configuration: Type.Optional(Type.Union([StructuredValueSchema, Type.Null()])),
	controlledAsset: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String()), Type.Any(), Type.Null()])),
	controlledProperty: Type.Optional(Type.Union([Type.Any(), Type.Array(Type.String()), Type.Null()])), // todo use map
	dataProvider: Type.Optional(Type.Union([Type.String(), Type.Any(), Type.Null()])),
	dateFirstUsed: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	dateInstalled: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	dateLastCalibration: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	dateLastValueReported: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	dateManufacured: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	deviceState: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	firmwareVersion: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	hardwareVersion: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	ipAddress: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String()), Type.Null()])),
	location: Type.Optional(Type.Union([Type.Any(), Type.Null()])),
	macAddress: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	mcc: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	mnc: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	osVersion: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	owner: Type.Optional(Type.Union([PersonSchema, OrganizationSchema, Type.Any(), Type.Null()])),
	provider: Type.Optional(Type.Union([PersonSchema, OrganizationSchema, Type.Any(), Type.Null()])),
	refDeviceModel: Type.Optional(Type.Union([Type.Any(), Type.Null()])),
	rssi: Type.Optional(Type.Union([Type.Number(), Type.Array(Type.Number()), Type.Null()])),
	serialNumber: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	softwareVersion: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	source: Type.Optional(Type.Union([Type.String(), Type.Any(), Type.Null()])),
	supportedProtocol: Type.Optional(Type.Union([Type.Any(), Type.Null()])), // todo use map
	value: Type.Optional(Type.Union([Type.String(), QuantitativeValueSchema, Type.Null()])), // todo use map
	fillingLevel: Type.Optional(Type.Union([Type.Number(), QuantitativeValueSchema, Type.Null()])) // todo use map
});
