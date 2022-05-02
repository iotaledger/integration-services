import {
	CreateChannelBodySchema,
	AddChannelLogBodySchema,
	CreateChannelResponseSchema,
	ChannelDataSchema,
	ReimportBodySchema,
	ValidateBodySchema,
	ValidateResponseSchema
} from '@iota/is-shared-modules/lib/models/schemas/request-response-body/channel-bodies';
import {
	ChannelInfoSchema,
	ChannelInfoSearchSchema,
	TopicSchema,
	ChannelAddressSchema
} from '@iota/is-shared-modules/lib/models/schemas/channel-info';
import {
	AuthorizeSubscriptionResponseSchema,
	AuthorizeSubscriptionBodySchema,
	RequestSubscriptionResponseSchema,
	RequestSubscriptionBodySchema,
	RevokeSubscriptionBodySchema
} from '@iota/is-shared-modules/lib/models/schemas/request-response-body/subscription-bodies';
import { ErrorResponseSchema, IdentityIdSchema } from '@iota/is-shared-modules/lib/models/schemas/request-response-body/misc-bodies';
import { SubscriptionSchema, SubscriptionUpdateSchema } from '@iota/is-shared-modules/lib/models/schemas/subscription';
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
	ReimportBodySchema,
	CreateChannelResponseSchema,
	AuthorizeSubscriptionResponseSchema,
	RequestSubscriptionResponseSchema,
	ValidateResponseSchema,
	ErrorResponseSchema,
	ChannelInfoSearchSchema,
	SubscriptionSchema,
	SubscriptionUpdateSchema,
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
