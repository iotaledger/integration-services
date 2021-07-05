// import { getJsonSchemaReader, getOpenApiWriter, makeConverter } from 'typeconv'

import { ProveOwnershipPostBodySchema } from '../../models/schemas/request-body/authentication-bodies';
import { CreateChannelBodySchema, AddChannelLogBodySchema, AuthorizeSubscriptionBodySchema, RequestSubscriptionBodySchema, CreateChannelBodyResponseSchema, ChannelDataSchema } from '../../models/schemas/request-body/channel-bodies';
import { ClaimSchema, RevokeVerificationBodySchema, VerifyIdentityBodySchema, VerifiableCredentialBodySchema, TrustedRootBodySchema, SubjectBodySchema } from '../../models/schemas/request-body/verification-bodies';
import { ChannelInfoSchema, ChannelInfoSearchSchema, TopicSchema } from '../../models/schemas/channel-info';
import { VcSubjectSchema, VerifiableCredentialSchema, IdentityJsonSchema, DocumentJsonUpdateSchema, IdentityDocumentJsonSchema, IdentityJsonUpdateSchema, IdentityKeyPairJsonSchema, LatestIdentityJsonSchema } from '../../models/schemas/identity';
import { CreateUserBodySchema, CreateIdentityBodySchema, UpdateUserBodySchema } from '../../models/schemas/request-body/user-bodies';
import {
    AggregateOfferSchema, AggregateRatingSchema, BrandSchema, DemandSchema, DistanceSchema, OfferSchema, PostalAddressSchema,
    QuantitativeValueSchema, ReviewRatingSchema, ReviewSchema, ServiceChannelSchema, StructuredValueSchema, ThingSchema,
} from '../../models/schemas/user-types-helper';
import { DeviceSchema, OrganizationSchema, PersonSchema, ProductSchema, ServiceSchema } from '../../models/schemas/user-types';
import { UserSchema, LocationSchema, UserWithoutIdFields } from '../../models/schemas/user';
import { AuthorizeSubscriptionBodyResponseSchema, RequestSubscriptionBodyResponseSchema } from '../../models/schemas/request-body/subscription-bodies';

import fs from 'fs'

const schemas = {
    ProveOwnershipPostBodySchema,
    CreateChannelBodySchema,
    CreateChannelBodyResponseSchema,
    "AddChannelLogBodySchema": AddChannelLogBodySchema,
    "ChannelDataSchema": ChannelDataSchema,
    "ChannelInfoSearchSchema": ChannelInfoSearchSchema,
    "AuthorizeSubscriptionBodySchema": AuthorizeSubscriptionBodySchema,
    "AuthorizeSubscriptionBodyResponseSchema": AuthorizeSubscriptionBodyResponseSchema,
    "RequestSubscriptionBodySchema": RequestSubscriptionBodySchema,
    "RequestSubscriptionBodyResponseSchema": RequestSubscriptionBodyResponseSchema,
    "ClaimSchema": ClaimSchema,
    "RevokeVerificationBodySchema": RevokeVerificationBodySchema,
    "VerifyIdentityBodySchema": VerifyIdentityBodySchema,
    "VerifiableCredentialBodySchema": VerifiableCredentialBodySchema,
    "TrustedRootBodySchema": TrustedRootBodySchema,
    "SubjectBodySchema": SubjectBodySchema,
    "ChannelInfoSchema": ChannelInfoSchema,
    "TopicSchema": TopicSchema,
    "VcSubjectSchema": VcSubjectSchema,
    "VerifiableCredentialSchema": VerifiableCredentialSchema,
    "IdentityJsonSchema": IdentityJsonSchema,
    "IdentityJsonUpdateSchema": IdentityJsonUpdateSchema,
    "IdentityKeyPairJsonSchema": IdentityKeyPairJsonSchema,
    "IdentityDocumentJsonSchema": IdentityDocumentJsonSchema,
    "LatestIdentityJsonSchema": LatestIdentityJsonSchema,
    "DocumentJsonUpdateSchema": DocumentJsonUpdateSchema,
    "CreateUserBodySchema": CreateUserBodySchema,
    "CreateIdentityBodySchema": CreateIdentityBodySchema,
    "UpdateUserBodySchema": UpdateUserBodySchema,
    "AggregateOfferSchema": AggregateOfferSchema,
    "AggregateRatingSchema": AggregateRatingSchema,
    "BrandSchema": BrandSchema,
    "DemandSchema": DemandSchema,
    "DistanceSchema": DistanceSchema,
    "OfferSchema": OfferSchema,
    "PostalAddressSchema": PostalAddressSchema,
    "QuantitativeValueSchema": QuantitativeValueSchema,
    "ReviewRatingSchema": ReviewRatingSchema,
    "ReviewSchema": ReviewSchema,
    "ServiceChannelSchema": ServiceChannelSchema,
    "StructuredValueSchema": StructuredValueSchema,
    "ThingSchema": ThingSchema,
    "DeviceSchema": DeviceSchema,
    "OrganizationSchema": OrganizationSchema,
    "PersonSchema": PersonSchema,
    "ProductSchema": ProductSchema,
    "ServiceSchema": ServiceSchema,
    "UserSchema": UserSchema,
    "LocationSchema": LocationSchema,
    "UserWithoutIdFields": UserWithoutIdFields

}

const openApiDoc = {
    "components": {
        "schemas": {}
    }
};

const converter = () => {
    const schemasCollection: any = {};
    for (const [key, value] of Object.entries(schemas)) {
        schemasCollection[key] = value
    }
    openApiDoc.components.schemas = schemasCollection
    fs.writeFile('./src/models/open-api-schema.yaml', JSON.stringify(openApiDoc), (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log('Successfully converted JSON schema.')
        }
    })
}

converter()