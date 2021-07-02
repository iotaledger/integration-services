import { getJsonSchemaReader, getOpenApiWriter, makeConverter } from 'typeconv'

import { ProveOwnershipPostBodySchema } from '../../models/schemas/request-body/authentication-bodies';
import { CreateChannelBodySchema, AddChannelLogBodySchema, AuthorizeSubscriptionBodySchema, RequestSubscriptionBodySchema } from '../../models/schemas/request-body/channel-bodies';
import { ClaimSchema, RevokeVerificationBodySchema, VerifyIdentityBodySchema, VerifiableCredentialBodySchema, TrustedRootBodySchema, SubjectBodySchema } from '../../models/schemas/request-body/verification-bodies';
import { ChannelInfoSchema, TopicSchema } from '../../models/schemas/channel-info';
import { VcSubjectSchema, VerifiableCredentialSchema, IdentityJsonSchema, DocumentJsonUpdateSchema, IdentityDocumentJsonSchema, IdentityJsonUpdateSchema, IdentityKeyPairJsonSchema, LatestIdentityJsonSchema } from '../../models/schemas/identity';
import { CreateUserBodySchema, CreateIdentityBodySchema, UpdateUserBodySchema } from '../../models/schemas/request-body/user-bodies';
import {
    AggregateOfferSchema, AggregateRatingSchema, BrandSchema, DemandSchema, DistanceSchema, OfferSchema, PostalAddressSchema,
    QuantitativeValueSchema, ReviewRatingSchema, ReviewSchema, ServiceChannelSchema, StructuredValueSchema, ThingSchema,
} from '../../models/schemas/user-types-helper';
import { DeviceSchema, OrganizationSchema, PersonSchema, ProductSchema, ServiceSchema } from '../../models/schemas/user-types';
import { UserSchema, LocationSchema, UserWithoutIdFields } from '../../models/schemas/user';


const schemas = {
    "definitions": {
        "ProveOwnershipPostBodySchema": ProveOwnershipPostBodySchema,
        "CreateChannelBodySchema": CreateChannelBodySchema,
        "AddChannelLogBodySchema": AddChannelLogBodySchema,
        "AauthorizeSubscriptionBodySchema": AuthorizeSubscriptionBodySchema,
        "RequestSubscriptionBodySchema": RequestSubscriptionBodySchema,
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
}


const converter = async () => {
    const reader = getJsonSchemaReader();
    const writer = getOpenApiWriter({ format: 'yaml', title: 'SSI-Bridge', version: 'v1', schemaVersion: '3.0.0' });

    const { convert } = makeConverter(reader, writer, { simplify: true });
    await convert({ 'data': JSON.stringify(schemas) }, { filename: './src/models/open-api-schemas.yaml' })
}

converter()

// import { Type } from '@sinclair/typebox';

// const testType = Type.Object({
//     name: Type.String({minLength: 5, maxLength: 10}),
//     creationDate: Type.String({format: 'date-time'})
// })


// const converter = async () => {
//     console.log({testType})
//     const reader = getJsonSchemaReader();
//     const writer = getOpenApiWriter({ format: 'yaml', title: 'SSI-Bridge', version: 'v1', schemaVersion: '3.0.0' });

//     const { convert } = makeConverter(reader, writer);
//     await convert({ 'data': JSON.stringify(testType) }, { filename: './src/models/test.yaml' })
// }

// converter()
