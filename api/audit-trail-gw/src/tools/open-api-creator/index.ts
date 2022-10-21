import {
	CreateChannelBodySchema,
	AddChannelLogBodySchema,
	CreateChannelResponseSchema,
	ChannelDataSchema,
	ValidateBodySchema,
	ValidateResponseSchema,
	ChannelInfoSchema,
	ChannelInfoSearchSchema,
	TopicSchema,
	ChannelAddressSchema,
	AuthorizeSubscriptionResponseSchema,
	AuthorizeSubscriptionBodySchema,
	RequestSubscriptionResponseSchema,
	RequestSubscriptionBodySchema,
	RevokeSubscriptionBodySchema,
	ErrorResponseSchema,
	IdentityIdSchema,
	SubscriptionSchema,
	SubscriptionUpdateSchema,
	SubscriptionStateSchema
} from '@iota/is-shared-modules';
import fs from 'fs';

/**
 * If new schemas have been created / changed just add them to the schemas object and run script: `npm run generate-openapi-schemas`
 */
const schemas = {
	CreateChannelBodySchema,
	AddChannelLogBodySchema,
	ChannelDataSchema,
	ValidateBodySchema,
	AuthorizeSubscriptionBodySchema,
	RequestSubscriptionBodySchema,
	RevokeSubscriptionBodySchema,
	CreateChannelResponseSchema,
	AuthorizeSubscriptionResponseSchema,
	RequestSubscriptionResponseSchema,
	ValidateResponseSchema,
	ErrorResponseSchema,
	ChannelInfoSearchSchema,
	SubscriptionSchema,
	SubscriptionUpdateSchema,
	SubscriptionStateSchema,
	ChannelInfoSchema,
	TopicSchema,
	IdentityIdSchema,
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
