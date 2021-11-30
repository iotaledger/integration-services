# Integration Services API Documentation
This is the API documentation for the Integration Services. Have a look at the repository for examples at [Github](https://github.com/iotaledger/integration-services).
            For further information on the Audit Trail GW API have a look at [Audit Trail API](https://github.com/iotaledger/integration-services/blob/master/api/usage-audit-trail-GW.md) and head to
            [SSI Bridge](https://github.com/iotaledger/integration-services/blob/master/api/usage-ssi-bridge.md) for information about the SSI Bridge.

## Version: 1.0.0

### /authentication/prove-ownership/{id}

#### GET
##### Summary

Request a nonce which must be signed by the private key

##### Description

Request a nonce which must be signed by the private key of the client and send it to /prove-ownership/{identity-id} endpoint via POST. This allows a user to prove ownership of its identity public key.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Returns a nonce. |
| 401 | No valid api key provided |
| 5XX | Unexpected error |

#### POST
##### Summary

Get an authentication token by signing a nonce

##### Description

Get an authentication token by signing a nonce using the private key. If signature is verified, a JWT string will be returned in the response. The nonce can be received from GET /prove-ownership/{identity-id} endpoint. The JWT is used for any future API interaction.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Returns a JSON Web Token (JWT). |
| 400 | No valid body provided |
| 401 | No valid api key provided |
| 500 | No valid signedNonce provided |
| 5XX | Unexpected error |

### /channel-info/search

#### GET
##### Summary

Search for a channel

##### Description

Search for a channel. A client can search for a channel which it is interested in.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| author | query |  | No | string |
| topic-type | query |  | No | string |
| topic-source | query |  | No | string |
| created | query |  | No | dateTime |
| latest-message | query |  | No | dateTime |
| limit | query |  | No | number |
| index | query |  | No | number |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Returns information about searched channels |
| 401 | No valid api key provided / Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /channel-info/channel/{channelAddress}

#### GET
##### Summary

Get information about a channel

##### Description

Get information about a channel with address channel-address.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Returns information about the channel |
| 401 | No valid api key provided |
| 5XX | Unexpected error |

#### DELETE
##### Summary

Delete information of a channel

##### Description

Delete information of a channel with address channel-address. The author of a channel can delete its entry in the database. In this case all subscriptions will be deleted and the channel won’t be found in the system anymore. The data & channel won’t be deleted from the IOTA Tangle since its data is immutable on the tangle!

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Channel successfully deleted |
| 401 | No valid api key provided/ Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /channel-info/channel

#### POST
##### Summary

Add an existing channel into the database

##### Description

Add an existing channel into the database. Clients are able to add existing channels into the database so others can subscribe to them. This will be automatically called when a channel will be created.

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Channel successfully added |
| 401 | No valid api key provided/ Not authenticated |
| 404 | Channel not found. |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

#### PUT
##### Summary

Update channel information

##### Description

Update channel information. The author of a channel can update topics of a channel.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Channel successfully added |
| 401 | No valid api key provided/ Not authenticated |
| 404 | Channel not found. |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /channels/create

#### POST
##### Summary

Create a new channel

##### Description

Create a new channel. An author can create a new channel with specific topics where other clients can subscribe to.

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Returns the created channel |
| 401 | No valid api key provided / Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /channels/logs/{channelAddress}

#### POST
##### Summary

Write data to a channel

##### Description

Write data to a channel with address channel address. Write permission is mandatory. The type and metadata fields are not encrypted to have a possibility to search for events. The payload is stored encrypted for encrypted channels.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Returns a link to the written data |
| 401 | No valid api key provided / Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

#### GET
##### Summary

Get data from the channel

##### Description

Get data from the channel with address channel address. The first possible message a subscriber can receive is the time the subscription got approved all messages before are not received. Read permission is mandatory.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |
| limit | query |  | No | number |
| index | query |  | No | number |
| asc | query |  | No | boolean |
| start-date | query |  | No | dateTime |
| end-date | query |  | No | dateTime |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Returns data from the channel |
| 401 | No valid api key provided / Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /channels/history/{channelAddress}

#### GET
##### Summary

Get the history of a channel.

##### Description

Get all data of a channel using a shared key (in case of encrypted channels). Mainly used from auditors to evaluate a log stream.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |
| preshared-key | query | Preshared key defined by the author to encrypt/decrypt data. | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Received history. |
| 5XX | Unexpected error |

### /channels/validate/{channelAddress}

#### POST
##### Summary

Validates channel data by comparing the log of each link with the data on the tangle.

##### Description

Validates data of a channel.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Returns validated result. |
| 401 | No valid api key provided / Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /channels/re-import/{channelAddress}

#### POST
##### Summary

Re import the data from the tangle into the database.

##### Description

The user can decide to re-import the data from the Tangle into the database. A reason for it could be a malicious state of the data.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Reimport successful. |
| 401 | No valid api key provided / Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /identities/create

#### POST
##### Summary

Create a new decentralized digital identity (DID)

##### Description

Create a new decentralized digital identity (DID). Identity DID document is signed and published to the ledger (IOTA Tangle). A digital identity can represent an individual, an organization or an object. The privateAuthKey controlling the identity is returned. It is recommended to securely (encrypt) store the privateAuthKey locally, since it is not stored on the APIs Bridge.

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Returns the created identity |
| 401 | No valid api key provided |
| 5XX | Unexpected error |

### /identities/search

#### GET
##### Summary

Search for identities

##### Description

Search for identities in the system and returns a list of existing identities.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| type | query |  | No | string |
| username | query |  | No | string |
| registration-date | query |  | No | dateTime |
| limit | query |  | No | number |
| index | query |  | No | number |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Return list of existing entities. |
| 401 | No valid api key provided / Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /identities/identity/{id}

#### GET
##### Summary

Get information about a specific identity

##### Description

Get information (including attached credentials) about a specific identity using the identity-id (DID identifier).

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Return a specific identity / none if no identity exits with given identity-id |
| 401 | No valid api key |
| 5XX | Unexpected error |

#### DELETE
##### Summary

Removes an identity from the Bridge

##### Description

Removes an identity from the Bridge. An identity can only delete itself and is not able to delete other identities. Administrators are able to remove other identities. The identity cannot be removed from the immutable IOTA Tangle but only at the Bridge. Also the identity credentials will remain and the identity is still able to interact with other bridges.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path |  | Yes | string |
| revoke-credentials | query | If true all credentials will be revoked and deleted. | No | boolean |
| revoke-subscriptions | query | If true all subscriptions will be revoked and deleted. | No | boolean |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Deleted Identity. |
| 401 | No valid api key provided / Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /identities/identity

#### POST
##### Summary

Register an existing identity into the Bridge

##### Description

Register an existing identity into the Bridge. This can be used if the identity already exists or it was only created locally. Registering an identity in the Bridge makes it possible to search for it by using some of the identity attributes, i.e., the username.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | The registered entity. |
| 401 | No valid api key |
| 5XX | Unexpected error |

#### PUT
##### Summary

Update claim of a registered identity

##### Description

Update claim of a registered identity.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | The registered entity. |
| 401 | No valid api key provided / Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /info

#### GET
##### Summary

Get information about the server

##### Description

Get information about the server like commitHash, server identity id and api version

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Returns information about the server |
| 5XX | Unexpected error |

### /subscriptions/{channelAddress}

#### GET
##### Summary

Get all subscriptions of a channel.

##### Description

Get all subscriptions of a channel. Use the is-authorized query parameter to filter for authorized subscriptions.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |
| is-authorized | query |  | No | boolean |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Subscriptions |
| 401 | No valid api key provided/ Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /subscriptions/{channelAddress}/{id}

#### GET
##### Summary

Get a subscription by identity id.

##### Description

Get a subscription of a channel by identity id.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |
| id | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Subscriptions |
| 401 | No valid api key provided/ Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

#### POST
##### Summary

Adds an existing subscription

##### Description

Adds an existing subscription (e.g. the subscription was not created with the api but locally.)

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |
| id | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Subscription added |
| 400 | Subscription already added or params missing |
| 401 | No valid api key provided/ Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

#### PUT
##### Summary

Updates an existing subscription

##### Description

Updates an existing subscription

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |
| id | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Subscription updated |
| 400 | Missing channelAddress / id |
| 401 | No valid api key provided/ Not authenticated |
| 404 | No subscription found |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

#### DELETE
##### Summary

Deletes subscription

##### Description

Deletes an existing subscription

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |
| id | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Subscription deleted |
| 400 | Missing channelAddress / id |
| 401 | No valid api key provided/ Not authenticated |
| 404 | No subscription found |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /subscriptions/request/{channelAddress}

#### POST
##### Summary

Request subscription to a channel

##### Description

Request subscription to a channel with address channel-address. A client can request a subscription to a channel which it then is able to read/write from.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Link to requested subscription |
| 400 | Subscription already requested |
| 401 | No valid api key provided/ Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /subscriptions/authorize/{channelAddress}

#### POST
##### Summary

Authorize a subscription to a channel

##### Description

Authorize a subscription to a channel with address channel-address. The author of a channel can authorize a subscriber to read/write from a channel. Eventually after verifying its identity (using the Ecommerce-SSI Bridge).

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Link to requested subscription |
| 401 | No valid api key provided/ Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /subscriptions/revoke/{channelAddress}

#### POST
##### Summary

Revoke subscription to a channel.

##### Description

Revoke subscription to a channel. Only the author of a channel can revoke a subscription from a channel.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| channelAddress | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Sucessfully revoked the subscription. |
| 401 | No valid api key provided/ Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /verification/latest-document/{id}

#### GET
##### Summary

Get the latest version of an identity document (DID)

##### Description

Get the latest version of an identity document (DID) from the IOTA Tangle.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Latest Identity document (DID) |
| 401 | No valid api key provided |
| 5XX | Unexpected error |

### /verification/trusted-roots

#### POST
##### Summary

Adds Trusted Root identity identifiers (DIDs)

##### Description

Adds Trusted Root identity identifiers (DIDs). Trusted roots are DIDs of identities which are trusted by the Bridge. This identity DIDs can be DIDs of other organizations. By adding them to the list Trusted Roots their Verifiable Credentials (VCs) are automatically trusted when checking at the Bridge.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Successful added trusted Root identity identifier. |
| 401 | No valid api key provided / Not authenticated / Not authorized |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

#### GET
##### Summary

Returns a list of Trusted Root identity identifiers (DIDs)

##### Description

Returns a list of Trusted Root identity identifiers (DIDs). Trusted roots are DIDs of identities which are trusted by the Bridge. This identity DIDs can be DIDs of other organizations. By adding them to the list Trusted Roots their Verifiable Credentials (VCs) are automatically trusted when checking at the Bridge.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | List of Trusted Root identity identifiers (DIDs). |
| 401 | No valid api key provided |
| 5XX | Unexpected error |

### /verification/trusted-roots/{trustedRootId}

#### DELETE
##### Summary

Remove Trusted Root identity identifiers (DIDs)

##### Description

Remove Trusted Root identity identifiers (DIDs). Trusted roots are DIDs of identities which are trusted by the Bridge. This identity DIDs can be DIDs of other organizations. By adding them to the list Trusted Roots their Verifiable Credentials (VCs) are automatically trusted when checking at the Bridge.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| trustedRootId | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Successful removed trusted Root identity identifier. |
| 401 | No valid api key provided / Not authenticated / Not authorized |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /verification/create-credential

#### POST
##### Summary

Verify the authenticity of an identity and issue a credential

##### Description

Verify the authenticity of an identity (of an individual, organization or object) and issue a credential stating the identity verification status. Only previously verified identities (based on a network of trust) with assigned privileges can verify other identities. Having a verified identity provides the opportunity for other identities to identify and verify a the entity they interact to.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | The created credential. |
| 401 | No valid api key provided / Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### /verification/check-credential

#### POST
##### Summary

Check the verifiable credential of an identity

##### Description

Check the verifiable credential of an identity. Validates the signed verifiable credential against the Issuer information stored onto the IOTA Tangle and checks if the issuer identity (DID) contained in the credential is from a trusted root.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | The registered entity. |
| 401 | No valid api key provided |
| 5XX | Unexpected error |

### /verification/revoke-credential

#### POST
##### Summary

Revoke one specific verifiable credential of an identity

##### Description

Revoke one specific verifiable credential of an identity. In the case of individual and organization identities the reason could be that the user has left the organization. Only organization admins (with verified identities) or the identity owner itself can do that.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Revoke successful |
| 401 | No valid api key provided / Not authenticated |
| 5XX | Unexpected error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| BearerAuth | |

### Models

#### ProveOwnershipPostBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| signedNonce | string |  | Yes |

#### CreateChannelBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| subscriptionPassword | string | If a subscriptionPassword is set, all data is encrypted with the password. It need to be made sure, the subscription password is sent when interacting with the APIs of the channel-service and subscription-service. | No |
| topics | [ object ] |  | Yes |
| hasPresharedKey | boolean | If the channel has a preshared key (hasPresharedKey=true) but non is set in the presharedKey property it will be generated by the api. | No |
| seed | string | If left empty the api will generate a seed automatically. Always store your seed otherwise the data can not be reimported. | No |
| presharedKey | string | If the channel has a preshared key (hasPresharedKey=true) but non is defined here the presharedKey will be generated by the api. | No |

#### AddChannelLogBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| type | string | Public available type. | No |
| created | dateTime | Public available date. | No |
| metadata |  | Public available metadata. | No |
| publicPayload |  | Public available payload. | No |
| payload |  | Payload is stored encrypted in the channel. | No |

#### ChannelDataSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| link | string |  | Yes |
| imported | dateTime | Date when the data was imported from the tangle into the cached database. | No |
| messageId | string | Message id can be used to search for the message in an IOTA explorer. | No |
| log | object |  | Yes |

#### ValidateBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| ValidateBodySchema | array |  |  |

#### AuthorizeSubscriptionBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| subscriptionLink | string |  | No |
| id | string |  | No |

#### RequestSubscriptionBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| seed | string | If left empty the api will generate a seed. Make sure you store the seed since the API will not store it. You can reuse your seed for different channels. | No |
| accessRights |  | _Enum:_ `"Audit"`, `"Read"`, `"Write"`, `"ReadAndWrite"` | No |
| presharedKey | string |  | No |

#### RevokeSubscriptionBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| subscriptionLink | string |  | No |
| id | string |  | No |

#### RevokeVerificationBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| signatureValue | string |  | Yes |

#### VerifyIdentityBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| subject | object |  | Yes |
| initiatorVC | object |  | No |

#### VerifiableCredentialBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| @context | string |  | Yes |
| id | string |  | Yes |
| type | [ string ] |  | Yes |
| credentialSubject | object |  | Yes |
| issuer | string |  | Yes |
| issuanceDate | dateTime |  | Yes |
| proof | object |  | Yes |

#### TrustedRootBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| trustedRootId | string |  | Yes |

#### SubjectBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string |  | Yes |
| credentialType | string |  | Yes |
| claim | object |  | Yes |

#### CreateIdentityBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| storeIdentity | boolean |  | No |
| username | string |  | No |
| registrationDate | dateTime |  | No |
| verifiableCredentials | [ object ] |  | No |
| role | string |  | No |
| claim | object |  | No |
| isPrivate | boolean |  | No |

#### UpdateIdentityBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string |  | Yes |

#### ReimportBodySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| seed | string |  | No |
| subscriptionPassword | string | If a subscriptionPassword is set, all data is encrypted with the password. It need to be made sure, the subscription password is sent when interacting with the APIs of the channel-service and subscription-service. | No |

#### CreateChannelResponseSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| seed | string |  | No |
| channelAddress | string |  | Yes |
| presharedKey | string |  | No |

#### AuthorizeSubscriptionResponseSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| keyloadLink | string |  | Yes |

#### RequestSubscriptionResponseSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| seed | string | Auto generated seed. Make sure you store the seed since the API will not store it. You can reuse your seed for different channels. | Yes |
| subscriptionLink | string |  | Yes |

#### ValidateResponseSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| ValidateResponseSchema | array |  |  |

#### ErrorResponseSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| error | string |  | Yes |

#### ChannelInfoSearchSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| authorId | string |  | No |
| author | string |  | No |
| topicType | string |  | No |
| topicSource | string |  | No |
| created | dateTime |  | No |
| latestMessage | dateTime |  | No |
| limit | number |  | No |
| index | number |  | No |

#### SubscriptionSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| type |  | _Enum:_ `"Author"`, `"Subscriber"` | Yes |
| channelAddress | string |  | Yes |
| id | string |  | Yes |
| state | string |  | Yes |
| subscriptionLink | string |  | No |
| isAuthorized | boolean |  | Yes |
| accessRights |  | _Enum:_ `"Audit"`, `"Read"`, `"Write"`, `"ReadAndWrite"` | Yes |
| publicKey | string |  | No |
| keyloadLink | string |  | No |
| sequenceLink | string |  | No |
| pskId | string |  | No |

#### SubscriptionUpdateSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| type |  | _Enum:_ `"Author"`, `"Subscriber"` | No |
| channelAddress | string |  | No |
| id | string |  | No |
| state | string |  | No |
| subscriptionLink | string |  | No |
| isAuthorized | boolean |  | No |
| accessRights |  | _Enum:_ `"Audit"`, `"Read"`, `"Write"`, `"ReadAndWrite"` | No |
| publicKey | string |  | No |
| keyloadLink | string |  | No |
| sequenceLink | string |  | No |
| pskId | string |  | No |

#### ClaimSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| type |  |  | Yes |

#### ChannelInfoSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| channelAddress | string |  | Yes |
| authorId | string |  | Yes |
| subscriberIds | [ string ] |  | No |
| topics | [ object ] |  | Yes |
| created | dateTime |  | No |
| latestMessage | dateTime |  | No |

#### TopicSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| type | string |  | Yes |
| source | string |  | Yes |

#### VerifiableCredentialSubjectSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string |  | Yes |
| type | string |  | Yes |
| initiatorId | string |  | No |

#### VerifiableCredentialSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| @context | string |  | Yes |
| id | string |  | Yes |
| type | [ string ] |  | Yes |
| credentialSubject | object |  | Yes |
| issuer | string |  | Yes |
| issuanceDate | dateTime |  | Yes |
| proof | object |  | Yes |

#### IdentityJsonSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| doc | object |  | Yes |
| key | object |  | Yes |

#### IdentityJsonUpdateSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| doc | object |  | Yes |
| key | object |  | Yes |
| txHash | string |  | Yes |

#### IdentityKeyPairJsonSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| type | string |  | Yes |
| public | string |  | Yes |
| secret | string |  | Yes |
| encoding |  | _Enum:_ `"base16"`, `"base58"`, `"base64"` | Yes |

#### IdentityDocumentJsonSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string |  | Yes |
| verificationMethod | [ object ] |  | No |
| previousMessageId | string |  | No |
| authentication | [ object ] |  | Yes |
| created | dateTime |  | Yes |
| updated | dateTime |  | Yes |
| immutable | boolean |  | Yes |
| proof | object |  | Yes |

#### LatestIdentityJsonSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| document | object |  | Yes |
| messageId | string |  | Yes |

#### DocumentJsonUpdateSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| doc | object |  | Yes |
| txHash | string |  | Yes |

#### DeviceSchema

Device schema, see the specification at: <https://github.com/smart-data-models/dataModel.Device/blob/master/Device/doc/spec.md> or <https://github.com/smart-data-models/dataModel.Device/blob/master/DeviceModel/doc/spec.md> or <https://petstore.swagger.io/?url=https://smart-data-models.github.io/dataModel.Device/Device/swagger.yaml#/ngsi-ld/get_ngsi_ld_v1_entities>

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| @context | string |  | No |
| type | string |  | No |
| alternateName | string |  | No |
| name | string |  | No |
| description | string |  | No |
| url | string |  | No |
| image |  |  | No |
| sameAs |  |  | No |
| category | [  ] |  | Yes |
| controlledProperty | [  ] |  | Yes |
| address | object | PostalAddress schema, see the specification at: <https://schema.org/PostalAddress> | No |
| batteryLevel | number |  | No |
| configuration |  |  | No |
| controlledAsset |  |  | No |
| dataProvider |  |  | No |
| dateFirstUsed | dateTime |  | No |
| dateInstalled | dateTime |  | No |
| dateLastCalibration | dateTime |  | No |
| dateLastValueReported | dateTime |  | No |
| dateManufacured | dateTime |  | No |
| deviceState | string |  | No |
| direction |  | _Enum:_ `"Inlet"`, `"Outlet"`, `"Entry"`, `"Exit"` | No |
| distance | number |  | No |
| dstAware | boolean |  | No |
| depth | number |  | No |
| firmwareVersion | string |  | No |
| hardwareVersion | string |  | No |
| ipAddress | [ string ] |  | No |
| location |  |  | No |
| macAddress | [ string ] |  | No |
| mcc | string |  | No |
| mnc | string |  | No |
| osVersion | string |  | No |
| owner |  |  | No |
| provider |  |  | No |
| refDeviceModel |  |  | No |
| relativePosition | string |  | No |
| rssi |  |  | No |
| serialNumber | string |  | No |
| softwareVersion | string |  | No |
| source |  |  | No |
| supportedProtocol |  | _Enum:_ `"3g"`, `"bluetooth"`, `"bluetooth LE"`, `"cat-m"`, `"coap"`, `"ec-gsm-iot"`, `"gprs"`, `"http"`, `"lwm2m"`, `"lora"`, `"lte-m"`, `"mqtt"`, `"nb-iot"`, `"onem2m"`, `"sigfox"`, `"ul20"`, `"websocket"` | No |
| value |  |  | No |

#### OrganizationSchema

Organization schema, see the specification at: <https://schema.org/Organization>

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| @context | string |  | No |
| type | string |  | No |
| alternateName | string |  | No |
| name | string |  | No |
| description | string |  | No |
| url | string |  | No |
| image |  |  | No |
| sameAs |  |  | No |
| brand |  |  | No |
| address |  |  | No |
| email | string |  | No |
| faxNumber | string |  | No |
| location | string |  | No |
| slogan | string |  | No |
| taxID | string |  | No |
| telephone | string |  | No |
| vatID | string |  | No |

#### PersonSchema

Person schema, see the specification at: <https://schema.org/Person>

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| @context | string |  | No |
| type | string |  | No |
| alternateName | string |  | No |
| name | string |  | No |
| description | string |  | No |
| url | string |  | No |
| image |  |  | No |
| sameAs |  |  | No |
| familyName | string |  | No |
| givenName | string |  | No |
| memberOf |  |  | No |
| worksFor |  |  | No |
| address |  |  | No |
| colleague |  |  | No |
| email | string |  | No |
| jobTitle | string |  | No |
| birthDate | date |  | No |
| height |  |  | No |
| weight |  |  | No |
| gender | string |  | No |
| nationality | string |  | No |
| telephone | string |  | No |

#### ProductSchema

Product schema, see the specification at: <https://schema.org/Product>

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| @context | string |  | No |
| type | string |  | No |
| alternateName | string |  | No |
| name | string |  | No |
| description | string |  | No |
| url | string |  | No |
| image |  |  | No |
| sameAs |  |  | No |
| aggregateRating | object | AggregateRating schema, see the specification at: <https://schema.org/AggregateRating> | No |
| award | string |  | No |
| brand |  |  | No |
| category | [ string ] |  | No |
| color | string |  | No |
| gtin | string |  | No |
| height |  |  | No |
| logo | string |  | No |
| manufacturer | object | Organization schema, see the specification at: <https://schema.org/Organization> | No |
| material |  |  | No |
| model | string |  | No |
| mpn | string |  | No |
| nsn | string |  | No |
| offers |  |  | No |
| pattern | string |  | No |
| productID | string |  | No |
| productionDate | dateTime |  | No |
| purchaseDate | dateTime |  | No |
| releaseDate | dateTime |  | No |
| review | object | Review schema, see the specification at: <https://schema.org/Review> | No |
| size |  |  | No |
| sku | string |  | No |
| slogan | string |  | No |
| weight |  |  | No |
| width |  |  | No |

#### ServiceSchema

Service schema, see the specification at: <https://schema.org/Service>

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| @context | string |  | No |
| type | string |  | No |
| alternateName | string |  | No |
| name | string |  | No |
| description | string |  | No |
| url | string |  | No |
| image |  |  | No |
| sameAs |  |  | No |
| aggregateRating | object | AggregateRating schema, see the specification at: <https://schema.org/AggregateRating> | No |
| availableChannel | object |  | No |
| brand |  |  | No |
| category | string |  | No |
| offers |  |  | No |
| provider |  |  | No |
| review |  |  | No |
| serviceOutput |  |  | No |
| serviceType | string |  | No |
| termsOfService | string |  | No |

#### IdentitySchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string |  | Yes |
| publicKey | string |  | Yes |
| username | string |  | No |
| registrationDate | dateTime |  | No |
| verifiableCredentials | [ object ] |  | No |
| role | string |  | No |
| claim | object |  | No |
| isPrivate | boolean |  | No |

#### IdentityIdSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| IdentityIdSchema | string |  |  |

#### NonceSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| nonce | string |  | Yes |

#### ChannelAddressSchema

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| ChannelAddressSchema | string |  |  |
