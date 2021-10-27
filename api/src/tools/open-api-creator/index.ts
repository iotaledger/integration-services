import { ProveOwnershipPostBodySchema, NonceSchema } from '../../models/schemas/request-response-body/authentication-bodies';
import {
	CreateChannelBodySchema,
	AddChannelLogBodySchema,
	CreateChannelResponseSchema,
	ChannelDataSchema,
	ReimportBodySchema,
	ValidateBodySchema,
	ValidateResponseSchema
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
	VerifiableCredentialSubjectSchema,
	VerifiableCredentialSchema,
	IdentityJsonSchema,
	DocumentJsonUpdateSchema,
	IdentityDocumentJsonSchema,
	IdentityJsonUpdateSchema,
	IdentityKeyPairJsonSchema,
	LatestIdentityJsonSchema
} from '../../models/schemas/identity';
import { CreateIdentityBodySchema, UpdateIdentityBodySchema } from '../../models/schemas/request-response-body/identity-bodies';
import { DeviceSchema, OrganizationSchema, PersonSchema, ProductSchema, ServiceSchema } from '../../models/schemas/user-types';
import { IdentitySchema } from '../../models/schemas/user';
import {
	AuthorizeSubscriptionResponseSchema,
	AuthorizeSubscriptionBodySchema,
	RequestSubscriptionResponseSchema,
	RequestSubscriptionBodySchema,
	RevokeSubscriptionBodySchema
} from '../../models/schemas/request-response-body/subscription-bodies';
import { ErrorResponseSchema, IdentityIdSchema } from '../../models/schemas/request-response-body/misc-bodies';
import { SubscriptionSchema, SubscriptionUpdateSchema } from '../../models/schemas/subscription';
import fs from 'fs';

/**
 * If new schemas have been created / changed just add them to the schemas object and run script: `generate-openapi-schemas`
 */
const schemas = {
	ProveOwnershipPostBodySchema,
	CreateChannelBodySchema,
	AddChannelLogBodySchema,
	ChannelDataSchema,
	ValidateBodySchema,
	AuthorizeSubscriptionBodySchema,
	RequestSubscriptionBodySchema,
	RevokeSubscriptionBodySchema,
	RevokeVerificationBodySchema,
	VerifyIdentityBodySchema,
	VerifiableCredentialBodySchema,
	TrustedRootBodySchema,
	SubjectBodySchema,
	CreateIdentityBodySchema,
	UpdateIdentityBodySchema,
	ReimportBodySchema,
	CreateChannelResponseSchema,
	AuthorizeSubscriptionResponseSchema,
	RequestSubscriptionResponseSchema,
	ValidateResponseSchema,
	ErrorResponseSchema,
	ChannelInfoSearchSchema,
	SubscriptionSchema,
	SubscriptionUpdateSchema,
	ClaimSchema,
	ChannelInfoSchema,
	TopicSchema,
	VerifiableCredentialSubjectSchema,
	VerifiableCredentialSchema,
	IdentityJsonSchema,
	IdentityJsonUpdateSchema,
	IdentityKeyPairJsonSchema,
	IdentityDocumentJsonSchema,
	LatestIdentityJsonSchema,
	DocumentJsonUpdateSchema,
	DeviceSchema,
	OrganizationSchema,
	PersonSchema,
	ProductSchema,
	ServiceSchema,
	IdentitySchema,
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
