// import { getJsonSchemaReader, getOpenApiWriter, makeConverter } from 'typeconv'

import { ProveOwnershipPostBodySchema, NounceSchema } from '../../models/schemas/request-response-body/authentication-bodies';
import { CreateChannelBodySchema, AddChannelLogBodySchema, AuthorizeSubscriptionBodySchema, RequestSubscriptionBodySchema, CreateChannelBodyResponseSchema, ChannelDataSchema } from '../../models/schemas/request-response-body/channel-bodies';
import { ClaimSchema, RevokeVerificationBodySchema, VerifyIdentityBodySchema, VerifiableCredentialBodySchema, TrustedRootBodySchema, SubjectBodySchema } from '../../models/schemas/request-response-body/verification-bodies';
import { ChannelInfoSchema, ChannelInfoSearchSchema, TopicSchema, ChannelAddressSchema } from '../../models/schemas/channel-info';
import { VcSubjectSchema, VerifiableCredentialSchema, IdentityJsonSchema, DocumentJsonUpdateSchema, IdentityDocumentJsonSchema, IdentityJsonUpdateSchema, IdentityKeyPairJsonSchema, LatestIdentityJsonSchema } from '../../models/schemas/identity';
import { CreateUserBodySchema, CreateIdentityBodySchema, UpdateUserBodySchema } from '../../models/schemas/request-response-body/user-bodies';
import {
    AggregateOfferSchema, AggregateRatingSchema, BrandSchema, DemandSchema, DistanceSchema, OfferSchema, PostalAddressSchema,
    QuantitativeValueSchema, ReviewRatingSchema, ReviewSchema, ServiceChannelSchema, StructuredValueSchema, ThingSchema,
} from '../../models/schemas/user-types-helper';
import { DeviceSchema, OrganizationSchema, PersonSchema, ProductSchema, ServiceSchema } from '../../models/schemas/user-types';
import { UserSchema, LocationSchema, UserWithoutIdFields } from '../../models/schemas/user';
import { AuthorizeSubscriptionBodyResponseSchema, RequestSubscriptionBodyResponseSchema } from '../../models/schemas/request-response-body/subscription-bodies';
import { ErrorResponseSchema, IdentityIdSchema } from '../../models/schemas/request-response-body/misc-bodies'

import fs from 'fs'

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
    CreateUserBodySchema,
    CreateIdentityBodySchema,
    UpdateUserBodySchema,
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
    UserSchema,
    LocationSchema,
    UserWithoutIdFields,
    ErrorResponseSchema,
    IdentityIdSchema,
    NounceSchema,
    ChannelAddressSchema
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