import { ProveOwnershipPostBodySchema, NonceSchema } from '@iota-is/shared-modules/lib/schemas/request-response-body/authentication-bodies';
import {
	CreateChannelBodySchema,
	AddChannelLogBodySchema,
	CreateChannelResponseSchema,
	ChannelDataSchema,
	ReimportBodySchema,
	ValidateBodySchema,
	ValidateResponseSchema
} from '@iota-is/shared-modules/lib/schemas/request-response-body/channel-bodies';
import {
	ClaimSchema,
	RevokeVerificationBodySchema,
	CreateCredentialBodySchema,
	VerifiableCredentialBodySchema,
	TrustedRootBodySchema,
	SubjectBodySchema
} from '@iota-is/shared-modules/lib/schemas/request-response-body/verification-bodies';
import {
	ChannelInfoSchema,
	ChannelInfoSearchSchema,
	TopicSchema,
	ChannelAddressSchema
} from '@iota-is/shared-modules/lib/schemas/channel-info';
import {
	VerifiableCredentialSubjectSchema,
	VerifiableCredentialSchema,
	IdentityJsonSchema,
	IdentityDocumentJsonSchema,
	IdentityKeyPairJsonSchema
} from '@iota-is/shared-modules/lib/schemas/identity';
import {
	CreateIdentityBodySchema,
	UpdateIdentityBodySchema
} from '@iota-is/shared-modules/lib/schemas/request-response-body/identity-bodies';
import {
	DeviceSchema,
	OrganizationSchema,
	PersonSchema,
	ProductSchema,
	ServiceSchema
} from '@iota-is/shared-modules/lib/schemas/user-types';
import { IdentitySchema } from '@iota-is/shared-modules/lib/schemas/user';
import {
	AuthorizeSubscriptionResponseSchema,
	AuthorizeSubscriptionBodySchema,
	RequestSubscriptionResponseSchema,
	RequestSubscriptionBodySchema,
	RevokeSubscriptionBodySchema
} from '@iota-is/shared-modules/lib/schemas/request-response-body/subscription-bodies';
import { ErrorResponseSchema, IdentityIdSchema } from '@iota-is/shared-modules/lib/schemas/request-response-body/misc-bodies';
import { SubscriptionSchema, SubscriptionUpdateSchema } from '@iota-is/shared-modules/lib/schemas/subscription';
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
