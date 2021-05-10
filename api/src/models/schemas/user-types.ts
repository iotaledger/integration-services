import { Type } from '@sinclair/typebox';

const description = (name: string) => `${name} schema, see the specification at: https://schema.org/${name}`;

export const ThingObject = {
	'@context': Type.Optional(Type.String({ minLength: 1 })),
	'@type': Type.Optional(Type.String({ minLength: 1 })),
	alternateName: Type.Optional(Type.String()),
	name: Type.Optional(Type.String()),
	description: Type.Optional(Type.String()),
	url: Type.Optional(Type.String()),
	image: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())])),
	sameAs: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())]))
};

export const ThingSchema = Type.Object({
	...ThingObject
});

export const DeviceCategorySchema = Type.Object({});
export const StructuredValueSchema = Type.Object({ ...ThingObject }, { description: description('StructuredValue') });

export const OfferSchema = Type.Object(
	{
		...ThingObject,
		material: Type.Optional(Type.String()),
		price: Type.Optional(Type.Union([Type.String(), Type.Number()])),
		priceCurrency: Type.Optional(Type.String()),
		priceValidUntil: Type.Optional(Type.String()),
		itemCondition: Type.Optional(Type.String()),
		availability: Type.Optional(Type.String())
	},
	{ description: description('Offer') }
);

export const AggregateRatingSchema = Type.Object(
	{
		...ThingObject,
		itemReviewed: Type.Optional(ThingSchema),
		ratingValue: Type.Optional(Type.Union([Type.String(), Type.Number()])),
		reviewCount: Type.Optional(Type.Union([Type.String(), Type.Number()]))
	},
	{ description: description('AggregateRating') }
);

export const ReviewRatingSchema = Type.Object(
	{
		...ThingObject,
		author: Type.Optional(Type.Any()), // reference organization or person
		bestRating: Type.Optional(Type.Union([Type.String(), Type.Number()])),
		ratingExplanation: Type.Optional(Type.String()),
		ratingValue: Type.Optional(Type.Union([Type.String(), Type.Number()])),
		reviewAspect: Type.Optional(Type.String()),
		worstRating: Type.Optional(Type.Union([Type.String(), Type.Number()]))
	},
	{ description: description('Rating') }
);

export const QuantitativeValueSchema = Type.Object(
	{
		...ThingObject,
		maxValue: Type.Optional(Type.Number()),
		minValue: Type.Optional(Type.Number()),
		unitCode: Type.Optional(Type.Union([Type.String(), Type.Number()])),
		unitText: Type.Optional(Type.String()),
		value: Type.Optional(Type.Union([Type.String(), Type.Number(), Type.Boolean(), StructuredValueSchema]))
	},
	{ description: description('QuantitativeValue') }
);

export const DistanceSchema = Type.Object(
	{
		...ThingObject
	},
	{ description: description('Distance') }
);

export const PostalAddressSchema = Type.Object(
	{
		...ThingObject,
		addressCountry: Type.Optional(Type.String()),
		addressLocality: Type.Optional(Type.String()),
		addressRegion: Type.Optional(Type.String()),
		postOfficeBoxNumber: Type.Optional(Type.String()),
		postalCode: Type.Optional(Type.String()),
		streetAddress: Type.Optional(Type.String())
	},
	{ description: description('PostalAddress') }
);

export const BrandSchema = Type.Object(
	{
		...ThingObject,
		aggregateRating: Type.Optional(AggregateRatingSchema),
		logo: Type.Optional(Type.String()),
		review: Type.Optional(Type.Any()), // reference review schema
		slogan: Type.Optional(Type.String())
	},
	{ description: description('Brand') }
);

export const OrganizationSchema = Type.Object(
	{
		...ThingObject,
		brand: Type.Optional(Type.Union([BrandSchema, Type.String()])),
		address: Type.Optional(Type.Union([PostalAddressSchema, Type.String()])),
		email: Type.Optional(Type.String()),
		faxNumber: Type.Optional(Type.String()),
		location: Type.Optional(Type.String()),
		slogan: Type.Optional(Type.String()),
		taxID: Type.Optional(Type.String()),
		telephone: Type.Optional(Type.String()),
		vatID: Type.Optional(Type.String())
	},
	{ description: description('Organization') }
);

export const PersonSchema = Type.Object(
	{
		...ThingObject,
		familyName: Type.Optional(Type.String()),
		givenName: Type.Optional(Type.String()),
		memberOf: Type.Optional(Type.Union([Type.Array(OrganizationSchema), OrganizationSchema, Type.String()])),
		worksFor: Type.Optional(Type.Union([Type.Array(OrganizationSchema), OrganizationSchema, Type.String()])),
		address: Type.Optional(Type.Union([PostalAddressSchema, Type.String()])),
		colleague: Type.Optional(Type.Union([Type.Array(Type.String())])),
		email: Type.Optional(Type.String()),
		jobTitle: Type.Optional(Type.String()),
		birthDate: Type.Optional(Type.String()),
		height: Type.Optional(Type.Union([DistanceSchema, QuantitativeValueSchema])),
		weight: Type.Optional(Type.Union([QuantitativeValueSchema])),
		gender: Type.Optional(Type.String()),
		nationality: Type.Optional(Type.String()),
		telephone: Type.Optional(Type.String())
	},
	{ description: description('Person') }
);

export const ReviewSchema = Type.Object(
	{
		...ThingObject,
		// TODO eventually add creativework schema and extend it??
		itemReviewed: Type.Optional(ThingSchema),
		reviewAspect: Type.Optional(Type.String()),
		reviewBody: Type.Optional(Type.String()),
		reviewRating: ReviewRatingSchema
	},
	{ description: description('Review') }
);

export const ProductSchema = Type.Object(
	{
		...ThingObject,
		aggregateRating: Type.Optional(Type.Union([AggregateRatingSchema])),
		award: Type.Optional(Type.String()),
		brand: Type.Optional(Type.Union([Type.String(), BrandSchema, OrganizationSchema])),
		category: Type.Optional(Type.Array(Type.String())),
		color: Type.Optional(Type.String()),
		image: Type.Optional(Type.Union([Type.Array(Type.String())])),
		gtin: Type.Optional(Type.String()),
		height: Type.Optional(Type.Union([DistanceSchema, QuantitativeValueSchema, Type.String()])),
		logo: Type.Optional(Type.String()),
		manufacturer: Type.Optional(OrganizationSchema),
		material: Type.Optional(Type.String()), // reference type product
		model: Type.Optional(Type.String()),
		mpn: Type.Optional(Type.String()),
		nsn: Type.Optional(Type.String()),
		offers: Type.Optional(Type.Union([Type.Array(OfferSchema)])), // TODO add demand schema
		pattern: Type.Optional(Type.String()),
		productID: Type.Optional(Type.String()),
		productionDate: Type.Optional(Type.String()),
		purchaseDate: Type.Optional(Type.String()),
		releaseDate: Type.Optional(Type.String()),
		review: Type.Optional(ReviewSchema),
		size: Type.Optional(Type.Union([Type.String(), QuantitativeValueSchema])),
		sku: Type.Optional(Type.String()),
		slogan: Type.Optional(Type.String()),
		weight: Type.Optional(Type.Union([QuantitativeValueSchema, Type.String()])),
		width: Type.Optional(Type.Union([DistanceSchema, QuantitativeValueSchema, Type.String()]))
	},
	{ description: description('Product') }
);

export const ServiceChannelSchema = Type.Object({
	...ThingObject,
	availableLanguage: Type.Optional(Type.String()),
	serviceUrl: Type.Optional(Type.String())
});

export const ServiceSchema = Type.Object(
	{
		...ThingObject,
		availableChannel: Type.Optional(ServiceChannelSchema),
		brand: Type.Optional(Type.Union([BrandSchema, OrganizationSchema])),
		category: Type.Optional(Type.String()),
		offers: Type.Optional(Type.Union([Type.Array(OfferSchema)])), // TODO add Demand Schema
		provider: Type.Optional(Type.Union([OrganizationSchema, PersonSchema])),
		review: Type.Optional(Type.Union([ReviewSchema, PersonSchema])),
		serviceOutput: Type.Optional(Type.Union([ThingSchema])),
		serviceType: Type.Optional(Type.String()),
		termsOfService: Type.Optional(Type.String())
	},
	{ description: description('Service') }
);

export enum ProductEnum {
	'actuator' = 'actuator',
	'beacon' = 'beacon',
	'endgun' = 'endgun',
	'HVAC' = 'HVAC',
	'implement' = 'implement',
	'irrSection' = 'irrSection',
	'irrSystem' = 'irrSystem',
	'meter' = 'meter',
	'multimedia' = 'multimedia',
	'network' = 'network',
	'sensor' = 'sensor'
}
export enum DeviceControlledProperty {
	'airPollution' = 'airPollution',
	'atmosphericPressure' = 'atmosphericPressure',
	'cdom' = 'cdom',
	'conductance' = 'conductance',
	'conductivity' = 'conductivity',
	'depth' = 'depth',
	'eatingActivity' = 'eatingActivity',
	'electricityConsumption' = 'electricityConsumption',
	'energy' = 'energy',
	'fillingLevel' = 'fillingLevel',
	'freeChlorine' = 'freeChlorine',
	'gasComsumption' = 'gasComsumption',
	'heading' = 'heading',
	'humidity' = 'humidity',
	'light' = 'light',
	'location' = 'location',
	'milking' = 'milking',
	'motion' = 'motion',
	'movementActivity' = 'movementActivity',
	'noiseLevel' = 'noiseLevel',
	'occupancy' = 'occupancy',
	'orp' = 'orp',
	'pH' = 'pH',
	'power' = 'power',
	'precipitation' = 'precipitation',
	'pressure' = 'pressure',
	'refractiveIndex' = 'refractiveIndex',
	'salinity' = 'salinity',
	'smoke' = 'smoke',
	'soilMoisture' = 'soilMoisture',
	'solarRadiation' = 'solarRadiation',
	'speed' = 'speed',
	'tds' = 'tds',
	'temperature' = 'temperature',
	'tss' = 'tss',
	'turbidity' = 'turbidity',
	'waterConsumption' = 'waterConsumption',
	'waterPollution' = 'waterPollution',
	'weatherConditions' = 'weatherConditions',
	'weight' = 'weight',
	'windDirection' = 'windDirection',
	'windSpeed' = 'windSpeed'
}

export enum DeviceDirection {
	'Inlet' = 'Inlet',
	'Outlet' = 'Outlet',
	'Entry' = 'Entry',
	'Exit' = 'Exit'
}

export enum DeviceProtocol {
	'3g' = '3g',
	'bluetooth' = 'bluetooth',
	'bluetooth LE' = 'bluetooth LE',
	'cat-m' = 'cat-m',
	'coap' = 'coap',
	'ec-gsm-iot' = 'ec-gsm-iot',
	'gprs' = 'gprs',
	'http' = 'http',
	'lwm2m' = 'lwm2m',
	'lora' = 'lora',
	'lte-m' = 'lte-m',
	'mqtt' = 'mqtt',
	'nb-iot' = 'nb-iot',
	'onem2m' = 'onem2m',
	'sigfox' = 'sigfox',
	'ul20' = 'ul20',
	'websocket' = 'websocket'
}
export const DeviceSchema = Type.Object(
	{
		...ThingObject,
		type: Type.String({ minLength: 1 }),
		category: Type.Array(Type.Enum(ProductEnum)),
		controlledProperty: Type.Array(Type.Enum(DeviceControlledProperty)),
		address: Type.Optional(PostalAddressSchema),
		batteryLevel: Type.Optional(Type.Number()),
		configuration: Type.Optional(Type.Union([StructuredValueSchema, Type.Any()])),
		controlledAsset: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String()), Type.Any()], Type.Any())),
		dataProvider: Type.Optional(Type.Union([Type.String(), Type.Any()])),
		dateFirstUsed: Type.Optional(Type.String({ format: 'date-time' })),
		dateInstalled: Type.Optional(Type.String({ format: 'date-time' })),
		dateLastCalibration: Type.Optional(Type.String({ format: 'date-time' })),
		dateLastValueReported: Type.Optional(Type.String({ format: 'date-time' })),
		dateManufacured: Type.Optional(Type.String({ format: 'date-time' })),
		deviceState: Type.Optional(Type.String()),
		direction: Type.Optional(Type.Enum(DeviceDirection)),
		distance: Type.Optional(Type.Number()),
		dstAware: Type.Optional(Type.Boolean()),
		depth: Type.Optional(Type.Number()),
		firmwareVersion: Type.Optional(Type.String()),
		hardwareVersion: Type.Optional(Type.String()),
		ipAddress: Type.Optional(Type.Array(Type.String())),
		location: Type.Optional(Type.Any()),
		macAddress: Type.Optional(Type.Array(Type.String())),
		mcc: Type.Optional(Type.String()),
		mnc: Type.Optional(Type.String()),
		osVersion: Type.Optional(Type.String()),
		owner: Type.Optional(Type.Union([PersonSchema, OrganizationSchema, Type.String(), Type.Array(Type.String())])),
		provider: Type.Optional(Type.Union([PersonSchema, OrganizationSchema, Type.String()])),
		refDeviceModel: Type.Optional(Type.Any()),
		relativePosition: Type.Optional(Type.String()),
		rssi: Type.Optional(Type.Union([Type.Number(), Type.Array(Type.Number())])),
		serialNumber: Type.Optional(Type.String()),
		softwareVersion: Type.Optional(Type.String()),
		source: Type.Optional(Type.Union([Type.String(), Type.Any()])),
		supportedProtocol: Type.Optional(Type.Enum(DeviceProtocol)),
		value: Type.Optional(Type.Union([Type.String(), QuantitativeValueSchema]))
	},
	{
		description:
			'Device schema, see the specification at: https://github.com/smart-data-models/dataModel.Device/blob/master/Device/doc/spec.md or https://github.com/smart-data-models/dataModel.Device/blob/master/DeviceModel/doc/spec.md or https://petstore.swagger.io/?url=https://smart-data-models.github.io/dataModel.Device/Device/swagger.yaml#/ngsi-ld/get_ngsi_ld_v1_entities'
	}
);
