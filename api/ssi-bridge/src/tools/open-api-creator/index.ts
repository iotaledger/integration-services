import {
	ProveOwnershipPostBodySchema,
	NonceSchema,
	CreateChannelBodySchema,
	AddChannelLogBodySchema,
	CreateChannelResponseSchema,
	ChannelDataSchema,
	ReimportBodySchema,
	ValidateBodySchema,
	ValidateResponseSchema,
	ClaimSchema,
	RevokeVerificationBodySchema,
	CreateCredentialBodySchema,
	VerifiableCredentialBodySchema,
	TrustedRootBodySchema,
	SubjectBodySchema,
	ChannelInfoSchema,
	ChannelInfoSearchSchema,
	TopicSchema,
	ChannelAddressSchema,
	VerifiableCredentialSubjectSchema,
	VerifiableCredentialSchema,
	IdentityJsonSchema,
	IdentityDocumentJsonSchema,
	IdentityKeyPairJsonSchema,
	CreateIdentityBodySchema,
	IdentitySearchBodySchema,
	UpdateIdentityBodySchema,
	LatestIdentityDocSchema,
	DeviceSchema,
	OrganizationSchema,
	PersonSchema,
	ProductSchema,
	ServiceSchema,
	IdentitySchema,
	AuthorizeSubscriptionResponseSchema,
	AuthorizeSubscriptionBodySchema,
	RequestSubscriptionResponseSchema,
	RequestSubscriptionBodySchema,
	RevokeSubscriptionBodySchema,
	ErrorResponseSchema,
	IdentityIdSchema,
	SubscriptionSchema,
	SubscriptionUpdateSchema
} from '@iota/is-shared-modules';
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
	CreateCredentialBodySchema,
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
	IdentityKeyPairJsonSchema,
	IdentityDocumentJsonSchema,
	LatestIdentityDocSchema,
	DeviceSchema,
	OrganizationSchema,
	PersonSchema,
	ProductSchema,
	ServiceSchema,
	IdentitySchema,
	IdentitySearchBodySchema,
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
