import { ProveOwnershipPostBodySchema, NonceSchema } from '../../models/schemas/request-response-body/authentication-bodies';
import {
	CreateChannelBodySchema,
	AddChannelLogBodySchema,
	CreateChannelBodyResponseSchema,
	ChannelDataSchema
} from '../../models/schemas/request-response-body/channel-bodies';
import {
	ClaimSchema,
	RevokeVerificationBodySchema,
	VerifyIdentityBodySchema,
	VerifiableCredentialBodySchema,
	TrustedRootBodySchema,
	SubjectBodySchema
} from '../../models/schemas/request-response-body/verification-bodies';
import { ChannelInfoSchema, ChannelInfoSearchSchema, TopicSchema, ChannelAddressSchema } from '../../models/schemas/channel-info';
import {
	VcSubjectSchema,
	VerifiableCredentialSchema,
	IdentityJsonSchema,
	DocumentJsonUpdateSchema,
	IdentityDocumentJsonSchema,
	IdentityJsonUpdateSchema,
	IdentityKeyPairJsonSchema,
	LatestIdentityJsonSchema
} from '../../models/schemas/identity';
import { CreateIdentityBodySchema, UpdateIdentityBodySchema } from '../../models/schemas/request-response-body/user-bodies';
import {
	AggregateOfferSchema,
	AggregateRatingSchema,
	BrandSchema,
	DemandSchema,
	DistanceSchema,
	OfferSchema,
	PostalAddressSchema,
	QuantitativeValueSchema,
	ReviewRatingSchema,
	ReviewSchema,
	ServiceChannelSchema,
	StructuredValueSchema,
	ThingSchema
} from '../../models/schemas/user-types-helper';
import { DeviceSchema, OrganizationSchema, PersonSchema, ProductSchema, ServiceSchema } from '../../models/schemas/user-types';
import { IdentitySchema, LocationSchema, IdentityWithoutIdFields } from '../../models/schemas/user';
import {
	AuthorizeSubscriptionBodyResponseSchema,
	AuthorizeSubscriptionBodySchema,
	RequestSubscriptionBodyResponseSchema,
	RequestSubscriptionBodySchema
} from '../../models/schemas/request-response-body/subscription-bodies';
import { ErrorResponseSchema, IdentityIdSchema } from '../../models/schemas/request-response-body/misc-bodies';

import { SubscriptionSchema } from '../../models/schemas/subscription';

import fs from 'fs';

/**
 * If new schemas have been created / changed just add them to the schemas object and run script: `generate-openapi-schemas`
 */
const schemas = {
	ProveOwnershipPostBodySchema,
	CreateChannelBodySchema,
	CreateChannelBodyResponseSchema,
	AddChannelLogBodySchema,
	ChannelDataSchema,
	ChannelInfoSearchSchema,
	AuthorizeSubscriptionBodySchema,
	AuthorizeSubscriptionBodyResponseSchema,
	RequestSubscriptionBodySchema,
	RequestSubscriptionBodyResponseSchema,
	SubscriptionSchema,
	ClaimSchema,
	RevokeVerificationBodySchema,
	VerifyIdentityBodySchema,
	VerifiableCredentialBodySchema,
	TrustedRootBodySchema,
	SubjectBodySchema,
	ChannelInfoSchema,
	TopicSchema,
	VcSubjectSchema,
	VerifiableCredentialSchema,
	IdentityJsonSchema,
	IdentityJsonUpdateSchema,
	IdentityKeyPairJsonSchema,
	IdentityDocumentJsonSchema,
	LatestIdentityJsonSchema,
	DocumentJsonUpdateSchema,
	CreateIdentityBodySchema,
	UpdateIdentityBodySchema,
	AggregateOfferSchema,
	AggregateRatingSchema,
	BrandSchema,
	DemandSchema,
	DistanceSchema,
	OfferSchema,
	PostalAddressSchema,
	QuantitativeValueSchema,
	ReviewRatingSchema,
	ReviewSchema,
	ServiceChannelSchema,
	StructuredValueSchema,
	ThingSchema,
	DeviceSchema,
	OrganizationSchema,
	PersonSchema,
	ProductSchema,
	ServiceSchema,
	IdentitySchema,
	LocationSchema,
	IdentityWithoutIdFields,
	ErrorResponseSchema,
	IdentityIdSchema,
	NonceSchema,
	ChannelAddressSchema
};

const openApiDoc = {
	components: {
		schemas: {}
	}
};

const converter = () => {
	const schemasCollection: any = {};
	for (const [key, value] of Object.entries(schemas)) {
		schemasCollection[key] = value;
	}
	openApiDoc.components.schemas = schemasCollection;
	fs.writeFile('./src/models/open-api-schema.yaml', JSON.stringify(openApiDoc), (err) => {
		if (err) {
			console.log(err);
		} else {
			console.log('Successfully converted JSON schema.');
		}
	});
};

converter();
