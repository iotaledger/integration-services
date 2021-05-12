import { Type } from '@sinclair/typebox';
import {
	AggregateRatingSchema,
	BrandSchema,
	DemandSchema,
	DeviceControlledProperty,
	DeviceDirection,
	DeviceProtocol,
	DistanceSchema,
	OfferSchema,
	PostalAddressSchema,
	ProductEnum,
	QuantitativeValueSchema,
	ReviewSchema,
	schemaDescriptionCreator,
	ServiceChannelSchema,
	StructuredValueSchema,
	ThingObject,
	ThingSchema
} from './user-types-helper';

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
	{ description: schemaDescriptionCreator('Organization') }
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
	{ description: schemaDescriptionCreator('Person') }
);

export const ProductSchema = Type.Object(
	{
		...ThingObject,
		aggregateRating: Type.Optional(AggregateRatingSchema),
		award: Type.Optional(Type.String()),
		brand: Type.Optional(Type.Union([Type.String(), BrandSchema, OrganizationSchema])),
		category: Type.Optional(Type.Array(Type.String())),
		color: Type.Optional(Type.String()),
		image: Type.Optional(Type.Union([Type.Array(Type.String())])),
		gtin: Type.Optional(Type.String()),
		height: Type.Optional(Type.Union([DistanceSchema, QuantitativeValueSchema, Type.String()])),
		logo: Type.Optional(Type.String()),
		manufacturer: Type.Optional(OrganizationSchema),
		material: Type.Optional(Type.Union([Type.String(), ThingSchema])), // reference type product
		model: Type.Optional(Type.String()),
		mpn: Type.Optional(Type.String()),
		nsn: Type.Optional(Type.String()),
		offers: Type.Optional(Type.Union([OfferSchema, DemandSchema])),
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
	{ description: schemaDescriptionCreator('Product') }
);

export const ServiceSchema = Type.Object(
	{
		...ThingObject,
		aggregateRating: Type.Optional(AggregateRatingSchema),
		availableChannel: Type.Optional(ServiceChannelSchema),
		brand: Type.Optional(Type.Union([BrandSchema, OrganizationSchema])),
		category: Type.Optional(Type.String()),
		offers: Type.Optional(Type.Union([OfferSchema, DemandSchema])),
		provider: Type.Optional(Type.Union([OrganizationSchema, PersonSchema])),
		review: Type.Optional(Type.Union([ReviewSchema, PersonSchema])),
		serviceOutput: Type.Optional(Type.Union([ThingSchema])),
		serviceType: Type.Optional(Type.String()),
		termsOfService: Type.Optional(Type.String())
	},
	{ description: schemaDescriptionCreator('Service') }
);

export const DeviceSchema = Type.Object(
	{
		...ThingObject,
		type: Type.String({ minLength: 1 }),
		category: Type.Array(Type.Enum(ProductEnum)),
		controlledProperty: Type.Array(Type.Enum(DeviceControlledProperty)),
		address: Type.Optional(PostalAddressSchema),
		batteryLevel: Type.Optional(Type.Number()),
		configuration: Type.Optional(Type.Union([StructuredValueSchema, ThingSchema])),
		controlledAsset: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String()), ThingSchema], ThingSchema)),
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
