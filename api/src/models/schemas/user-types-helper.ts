import { Type } from '@sinclair/typebox';

export const schemaDescriptionCreator = (name: string) => `${name} schema, see the specification at: https://schema.org/${name}`;

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

export enum OfferItemConidition {
	DamagedCondition = 'DamagedCondition',
	NewCondition = 'NewCondition',
	RefurbishedCondition = 'RefurbishedCondition',
	UsedCondition = 'UsedCondition'
}

export enum ItemAvailability {
	BackOrder = 'BackOrder',
	Discontinued = 'Discontinued',
	InStock = 'InStock',
	InStoreOnly = 'InStoreOnly',
	LimitedAvailability = 'LimitedAvailability',
	OnlineOnly = 'OnlineOnly',
	OutOfStock = 'OutOfStock',
	PreOrder = 'PreOrder',
	PreSale = 'PreSale',
	SoldOut = 'SoldOut'
}

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

export const StructuredValueSchema = Type.Object({ ...ThingObject }, { description: schemaDescriptionCreator('StructuredValue') });

export const OfferSchema = Type.Object(
	{
		...ThingObject,
		availability: Type.Optional(Type.Enum(ItemAvailability)),
		availabilityEnds: Type.Optional(Type.String()),
		availabilityStarts: Type.Optional(Type.String()),
		businessFunction: Type.Optional(Type.String()),
		category: Type.Optional(Type.Union([Type.String(), ThingSchema])),
		material: Type.Optional(Type.String()),
		offeredBy: Type.Optional(Type.Union([Type.String(), ThingSchema])),
		gtin: Type.Optional(Type.String()),
		price: Type.Optional(Type.Union([Type.String(), Type.Number()])),
		priceCurrency: Type.Optional(Type.String()),
		priceValidUntil: Type.Optional(Type.String()),
		itemCondition: Type.Optional(Type.Enum(OfferItemConidition)),
		itemOffered: Type.Optional(ThingSchema),
		seller: Type.Optional(ThingSchema),
		serialNumber: Type.Optional(Type.String()),
		validFrom: Type.Optional(Type.String()),
		validThrough: Type.Optional(Type.String())
	},
	{ description: schemaDescriptionCreator('Offer') }
);

export const DemandSchema = Type.Object(
	{
		...ThingObject,
		availability: Type.Optional(Type.Enum(ItemAvailability)),
		availabilityEnds: Type.Optional(Type.String()),
		availabilityStarts: Type.Optional(Type.String()),
		businessFunction: Type.Optional(Type.String()),
		gtin: Type.Optional(Type.String()),
		itemCondition: Type.Optional(Type.Enum(OfferItemConidition)),
		itemOffered: Type.Optional(ThingSchema),
		seller: Type.Optional(ThingSchema),
		serialNumber: Type.Optional(Type.String()),
		validFrom: Type.Optional(Type.String()),
		validThrough: Type.Optional(Type.String())
	},
	{ description: schemaDescriptionCreator('Demand') }
);

export const AggregateRatingSchema = Type.Object(
	{
		...ThingObject,
		author: Type.Optional(ThingSchema), // reference organization or person
		bestRating: Type.Optional(Type.Union([Type.String(), Type.Number()])),
		worstRating: Type.Optional(Type.Union([Type.String(), Type.Number()])),
		itemReviewed: Type.Optional(ThingSchema),
		ratingExplanation: Type.Optional(Type.String()),
		ratingValue: Type.Optional(Type.Union([Type.String(), Type.Number()])),
		reviewCount: Type.Optional(Type.Union([Type.String(), Type.Number()]))
	},
	{ description: schemaDescriptionCreator('AggregateRating') }
);

export const ReviewRatingSchema = Type.Object(
	{
		...ThingObject,
		author: Type.Optional(ThingSchema), // reference organization or person
		bestRating: Type.Optional(Type.Union([Type.String(), Type.Number()])),
		ratingExplanation: Type.Optional(Type.String()),
		ratingValue: Type.Optional(Type.Union([Type.String(), Type.Number()])),
		reviewAspect: Type.Optional(Type.String()),
		worstRating: Type.Optional(Type.Union([Type.String(), Type.Number()]))
	},
	{ description: schemaDescriptionCreator('Rating') }
);

export const ReviewSchema = Type.Object(
	{
		...ThingObject,
		itemReviewed: Type.Optional(ThingSchema),
		reviewAspect: Type.Optional(Type.String()),
		reviewBody: Type.Optional(Type.String()),
		reviewRating: ReviewRatingSchema
	},
	{ description: schemaDescriptionCreator('Review') }
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
	{ description: schemaDescriptionCreator('QuantitativeValue') }
);

export const ServiceChannelSchema = Type.Object({
	...ThingObject,
	availableLanguage: Type.Optional(Type.String()),
	serviceUrl: Type.Optional(Type.String())
});

export const DistanceSchema = Type.Object(
	{
		...ThingObject
	},
	{ description: schemaDescriptionCreator('Distance') }
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
	{ description: schemaDescriptionCreator('PostalAddress') }
);

export const BrandSchema = Type.Object(
	{
		...ThingObject,
		aggregateRating: Type.Optional(AggregateRatingSchema),
		logo: Type.Optional(Type.String()),
		review: Type.Optional(ThingSchema), // reference review schema
		slogan: Type.Optional(Type.String())
	},
	{ description: schemaDescriptionCreator('Brand') }
);
