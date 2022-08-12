# IOTA Integration Services Javascript Client
This is the javascript client for easy usability of the Integration Services API.
## Table of contents
1. [Prerequisites](#prerequisites)
2. [Examples](#examples)
    1. [Create a Admin Identity](#create-a-admin-identity)
    2. [Create an Identity and a Credential](#create-an-identity-and-a-credential)
    3. [Update Users](#update-users)
    4. [Delete Users](#delete-users)
    5. [Adding Trusted Authorities](#adding-trusted-authorities)
    6. [Create a Channel](#create-a-channel)
    7. [Authorize to Channel](#authorize-to-channel)
    8. [Search Channels and Verify Data](#search-channels-and-verify-data)
3. [API Documentation](#api-documentation)
3. [Reporting Bugs](#bugs)
4. [Build the Package](#build-the-package)



## Prerequisites

- A running instance of the [Integration Services API](https://github.com/iotaledger/integration-services)


## Examples

The following examples will show you the basics of the Integration Services Client. For the most up-to-date examples visit the [integration services repository](https://github.com/iotaledger/integration-services/tree/develop/clients/client-sdk/examples#readme).

### Create a Admin Identity
Most examples need authentication by an admin identity. Therefor we create a script in the SSI-Bridge to generate a admin identity for you. 

Option 1 (recommended)
1. Navigate to the ssi-bridge root directory: `cd api/ssi-bridge`
2. Run the script: `npm run setup-admin-identity`
3. Make sure to copy the created `adminIdentity.json` to the root of your directory to use it in the examples 

Option 2
1. Run the `example-0` script in the [client examples](https://github.com/iotaledger/integration-services/tree/develop/clients/client-sdk/examples)

### Create an Identity and a Credential
This examples shows how to authenticate the admin identity from the previous example, create a new identity and issue a credential to the newly created identity. 

```javascript
import { IdentityClient, CredentialTypes, UserType, IdentityJson } from '@iota/is-client';
import { defaultConfig } from './configuration';
import { readFileSync } from 'fs';

async function createIdentityAndCheckVCs() {
  const identity = new IdentityClient(defaultConfig);

  // Recover the admin identity
  const adminIdentity = JSON.parse(readFileSync('./adminIdentity.json').toString()) as IdentityJson;

  // Authenticate as the admin identity
  await identity.authenticate(adminIdentity.doc.id, adminIdentity.key.secret);

  // Get admin identity data
  const adminIdentityPublic = await identity.find(adminIdentity.doc.id);

  // Get admin identy's VC
  const identityCredential = adminIdentityPublic?.verifiableCredentials?.[0];

  console.log('Identity Credential of Admin', identityCredential);

  // Create identity for user
  const username = 'User-' + Math.ceil(Math.random() * 100000);
  const userIdentity = await identity.create(username);

  console.log('~~~~~~~~~~~~~~~~');
  console.log('Created user identity: ', userIdentity);
  console.log('~~~~~~~~~~~~~~~~');
  // Assign a verifiable credential to the user as rootIdentity.
  // With the BasicIdentityCredential the user is not allowed to issue further credentials
  const userCredential = await identity.createCredential(
    identityCredential,
    userIdentity?.doc?.id,
    CredentialTypes.BasicIdentityCredential,
    UserType.Person,
    {
      profession: 'Professor'
    }
  );

  console.log('Created credential: ', userCredential);
  console.log('~~~~~~~~~~~~~~~~');
  // Verify the credential issued
  const verified = await identity.checkCredential(userCredential);

  console.log('Verification result: ', verified);
}

createIdentityAndCheckVCs();
```

### Update Users
In this example a already existing identity is updated. Again in the admin identity from the first example is needed.

```javascript
import { SearchCriteria, IdentityClient, IdentityJson } from '@iota/is-client';
import { defaultConfig } from './configuration';
import { readFileSync } from 'fs';

async function searchIdentityAndUpdate() {
  const identity = new IdentityClient(defaultConfig);

  // Recover the admin identity
  const adminIdentity = JSON.parse(readFileSync('./adminIdentity.json').toString()) as IdentityJson;

  // Authenticate as the admin identity
  await identity.authenticate(adminIdentity.doc.id, adminIdentity.key.secret);

  const username = 'MyUser-' + Math.ceil(Math.random() * 100000);
  const userIdentity = await identity.create(username);

  console.log('~~~~~~~~~~~~~~~~');
  console.log('Created user identity: ', userIdentity);
  console.log('~~~~~~~~~~~~~~~~');

  // Search for identities with username 'User' in it
  const search: SearchCriteria = { username: 'MyUser-' };

  const identities = await identity.search(search);

  console.log('Found the following identities:');
  console.log(JSON.stringify(identities, null, 2));

  if (identities && identities[0]) {
    // Take the latest identity of the searched identities
    const ids = identities.sort((a, b) => {
      // @ts-ignore
      return new Date(a.registrationDate) - new Date(b.registrationDate);
    });

    const userIdentity = ids[ids.length - 1];

    console.log('userIdentiy', userIdentity);

    const newUsername = 'Updated' + userIdentity.username;

    // Update the claim of the identity with a new username
    await identity.update({
      ...userIdentity,
      username: newUsername
    });
    console.log(`Successfully updated identity with id: ${userIdentity?.id}`);
  } else {
    console.log('Could not find identities with given search criteria.');
  }
}

searchIdentityAndUpdate();
```

### Delete Users
This example shows how to delete an identity from the SSI-Bridge.

```javascript
import { SearchCriteria, IdentityClient, IdentityJson } from '@iota/is-client';
import { defaultConfig } from './configuration';
import { readFileSync } from 'fs';

async function searchIdentityAndDelete() {
  const identity = new IdentityClient(defaultConfig);

  // Recover the admin identity
  const adminIdentity = JSON.parse(readFileSync('./adminIdentity.json').toString()) as IdentityJson;

  // Authenticate as the root identity
  await identity.authenticate(adminIdentity.doc.id, adminIdentity.key.secret);

  const username = 'User-' + Math.ceil(Math.random() * 100000);
  const userIdentity = await identity.create(username);

  console.log('Created Identity', userIdentity);

  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
  const search: SearchCriteria = { registrationDate: yesterday, username: username };
  // Search for identities that have been created yesterday or later (today)
  const identities = await identity.search(search);

  console.log('Found the following identities', identities);

  if (identities) {
    const erasableIdentities = identities.filter((item) => !item.isServerIdentity);

    if (erasableIdentities.length > 0) {
      // Take the first identities of the searched identities
      const userIdentity = erasableIdentities[0];

      console.log('Removing Identity', userIdentity);

      // Remove the user and also revoke the user's credentials
      await identity.remove(userIdentity.id, true);
      console.log(`Successfully deleted identity with id: ${userIdentity.id}`);

      // Although the user is removed from the bridge the user's identity document can still be retrieved from the tangle
      const recoveredIdentity = await identity.latestDocument(userIdentity.id);
      console.log('Identity document: ', recoveredIdentity);
    }
  } else {
    console.log('Could not find identities with given search criteria.');
  }
}


searchIdentityAndDelete();
```

### Adding Trusted Authorities
This examples shows you how to add a trusted authority. Only credentials issued by a trusted authority are trusted.

```javascript
import { IdentityClient, CredentialTypes, UserType, IdentityJson } from '@iota/is-client';
import { defaultConfig } from './configuration';
import { readFileSync } from 'fs';
import { externalDriverCredential1 } from './externalData';

async function trustedAuthorities() {
  const identity = new IdentityClient(defaultConfig);

  // Recover the admin identity
  const adminIdentity = JSON.parse(readFileSync('./adminIdentity.json').toString()) as IdentityJson;

  // Authenticate as the admin identity
  await identity.authenticate(adminIdentity.doc.id, adminIdentity.key.secret);

  // Create an identity for a driver to issue him a driving license
  const username = 'Driver-' + Math.ceil(Math.random() * 100000);
  const driverIdentity = await identity.create(username);

  //Get root identity to issue an credential for the new driver
  const adminIdentityPublic = await identity.find(adminIdentity.doc.id);
  console.log(`Root identity's id: `, adminIdentityPublic.id);

  // Get root identity's credential to create new credentials
  // @ts-ignore: Object is possibly 'null'.
  const identityCredential = adminIdentityPublic!.verifiableCredentials[0];

  // List all trusted authorities, currently only one authority is trusted for issuing credentials
  const trustedAuthorities = await identity.getTrustedAuthorities();
  console.log('Trusted authorities: ', trustedAuthorities);

  // Assign a verifiable credential to the driver for drive allowance
  const driverCredential = await identity.createCredential(
    identityCredential,
    driverIdentity?.doc?.id,
    CredentialTypes.BasicIdentityCredential,
    UserType.Person,
    {
      driveAllowance: true,
      issuanceDate: new Date()
    }
  );

  // Verify the drivers license issued by the local authority.
  // Verification result should be positive
  const verified1 = await identity.checkCredential(driverCredential);
  console.log('Internal drivers license verification: ', verified1);

  // Verify the drivers license issued by an external authority.
  // This drivers license will not be trusted because it was not added as an trusted authority by us.
  const verified2 = await identity.checkCredential(externalDriverCredential1);
  console.log('Driving authority verification: ', verified2);

  // Added the external authority to the trusted authorities.
  // The id of the external authority can be found in the external credential
  const externalTrustedAuthority = externalDriverCredential1.issuer;
  await identity.addTrustedAuthority(externalTrustedAuthority);

  // List all trustedAuthorities, to verify the external authority has been added
  const trustedAuthorities2 = await identity.getTrustedAuthorities();
  console.log('Trusted authorities: ', trustedAuthorities2);

  // Verify the drivers license issued by the local authority again
  // Verification result should be true again
  const verified4 = await identity.checkCredential(driverCredential);
  console.log('Internal drivers license verification: ', verified4);

  // Verify the drivers license issued by an external authority.
  // This time the verification result should be positive
  const verified5 = await identity.checkCredential(externalDriverCredential1);
  console.log('Driving authority verification: ', verified5);

  // Remove the external authority again, just for repeatability
  await identity.removeTrustedAuthority(externalTrustedAuthority);
}

trustedAuthorities();
```

### Create a Channel
This examples shows you how to create a channel and write data to the created channel.

```javascript

import { IdentityClient, ChannelClient } from '@iota/is-client';

import { defaultConfig } from './configuration';

const channel = new ChannelClient(defaultConfig);
const identity = new IdentityClient(defaultConfig);

async function createChannel() {
  // Create a new user. The user is used for authentication only.
  const username = 'User-' + Math.ceil(Math.random() * 100000);
  const user = await identity.create(username);

  console.log('User', user);

  // Authenticate as the user
  await channel.authenticate(user.doc.id, user.key.secret);

  // Create a new channel for example data
  const logChannel = await channel.create({
    name: `Channel-${Math.ceil(Math.random() * 100000)}`,
    topics: [{ type: 'example-data', source: 'data-creator' }]
  });

  console.log('Log Channel', logChannel);

  // The channel address is used to read and write to channels
  const channelAddress = logChannel.channelAddress;
  console.log(`Channel address: ${channelAddress}`);

  // Writing 5 data packets to channel
  for (let i = 1; i <= 5; i++) {
    console.log(`Writing channel data ${i}`);
    await channel.write(channelAddress, {
      type: 'log',
      created: new Date().toISOString(),
      payload: {
        log: `This is log file #${i}`
      }
    });
  }

  // Reading channel
  const channelData = await channel.read(channelAddress);
  console.log('Read from channel:');
  channelData.forEach((data) => {
    console.log(data.log);
  });
}

createChannel();
```

### Authorize to Channel
This example shows you how to authorize other identities to read and write to a newly created channel.

```javascript
import { AccessRights, IdentityClient, ChannelClient } from '@iota/is-client';

import { defaultConfig } from './configuration';

// In this example we will use two instances of the ChannelClient() both will authenticate a different user.
const ownerClient = new ChannelClient(defaultConfig);
const userClient = new ChannelClient(defaultConfig);
const identity = new IdentityClient(defaultConfig);

async function authorizeOthersToChannel() {
  // Creating a channel owner who creates the channel and a channel user who will be authorized to read the channel
  console.log('Creating user...');
  const ownerUsername = 'Owner-' + Math.ceil(Math.random() * 100000);
  const subscriberUsername = 'Subscriber-' + Math.ceil(Math.random() * 100000);
  const channelOwner = await identity.create(ownerUsername);
  const channelUser = await identity.create(subscriberUsername);

  // We will use two instances of the channel api client. One is getting authorized by the owner and the other one by the user.
  await ownerClient.authenticate(channelOwner.doc.id, channelOwner.key.secret);
  await userClient.authenticate(channelUser.doc.id, channelUser.key.secret);

  // The owner creates a channel where he/she want to publish data of type 'example-data'.
  const { channelAddress } = await ownerClient.create({
    name: `Channel-${Math.ceil(Math.random() * 100000)}`,
    topics: [{ type: 'example-data', source: 'example-creator' }]
  });

  console.log('Writing to channel...');
  // Writing data to the channel as the channel owner.
  await ownerClient.write(channelAddress, {
    payload: { log: `This is log file 1` }
  });

  // This attempt to read the channel will fail because the channel user is no authorized to read the channel.
  try {
    const channelData = await userClient.read(channelAddress);
  } catch (error: any) {
    console.error('Error: ', error?.response?.data?.error);
  }

  // Request subscription to the channel as the user. The returned subscriptionLink can be used to authorize the user to the channel.
  const { subscriptionLink } = await userClient.requestSubscription(channelAddress, {
    accessRights: AccessRights.ReadAndWrite
  });

  console.log('Subscription Link:', subscriptionLink);

  // Find subscriptions to the channel that are not already authorized.
  const subscriptions = await ownerClient.findAllSubscriptions(channelAddress, false);

  console.log('Subscriptions Found:', subscriptions);

  const unauthorizedSubscriptions = subscriptions.filter(
    (subscription) => !subscription.isAuthorized
  );

  console.log('Unauthorized subscriptions:', unauthorizedSubscriptions);

  for (const subscription of unauthorizedSubscriptions) {
    console.log(`Authorizing subscription: ${subscription.id}...`);
    // Authorize the user to the channel. Authorization can happen via the id of the user or the generated subscription link.
    const keyloadLink = await ownerClient.authorizeSubscription(channelAddress, {
      id: channelUser.doc.id
    });
    console.log('Subscription Keyload Link:', keyloadLink);
  }

  // Writing data to channel as the channel owner. Make sure to authorize potential channel readers beforehand.
  console.log('Writing to channel...');
  await ownerClient.write(channelAddress, {
    payload: { log: `This is log file 2` }
  });

  // Reading the channel as the user
  console.log('reading as subscriber...');
  const channelData = await userClient.read(channelAddress);
  console.log('First channel data log: ', channelData?.[0]?.log?.payload);
}

authorizeOthersToChannel();
```

### Search Channels and Verify Data
This example shows you how to search for channels and verify that data has not been tampered with.

```javascript
import { IdentityClient, ChannelClient } from '@iota/is-client';

import { defaultConfig } from './configuration';

// In this example we will use two instances of the ChannelClient() both will authenticate a different user.
const ownerClient = new ChannelClient(defaultConfig);
const userClient = new ChannelClient(defaultConfig);
const identity = new IdentityClient(defaultConfig);

async function searchChannelAndValidateData() {
  // Creating a channel owner who creates the channel and a channel user who will be authorized to read the channel
  console.log('Creating user...');
  const ownerUsername = 'Owner-' + Math.ceil(Math.random() * 100000);
  const subscriberUsername = 'Subscriber-' + Math.ceil(Math.random() * 100000);
  const channelOwner = await identity.create(ownerUsername);
  const channelUser = await identity.create(subscriberUsername);

  // We will use two instances of the channel api client. One is getting authorized by the owner and the other one by the user.
  await ownerClient.authenticate(channelOwner.doc.id, channelOwner.key.secret);
  await userClient.authenticate(channelUser.doc.id, channelUser.key.secret);

  // The owner creates a channel where he/she want to publish data of type 'example-data'.
  const { channelAddress } = await ownerClient.create({
    name: `Channel-${Math.ceil(Math.random() * 100000)}`,
    topics: [{ type: 'example-data', source: 'example-creator' }]
  });

  // Search for channels that where created since midnight with topic type 'example-data' and with specified authorId.
  // Just passing in new Date() to 'created' will never yield results since it selects only channels that where create
  // later or equal to the specified date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const channels = await userClient.search({
    authorId: channelOwner.doc.id,
    topicType: 'example-data',
    created: today
  });

  if (channels.length == 0) {
    console.error('Could not find any channels matching the search criteria.');
    return;
  }

  // Request subscription to the first channel
  const { subscriptionLink } = await userClient.requestSubscription(channels[0].channelAddress);

  // Authorize subscription by subscription link
  await ownerClient.authorizeSubscription(channelAddress, { subscriptionLink });

  // Writing data to the channel as the channel owner.
  await ownerClient.write(channelAddress, {
    payload: { log: `This is log file 1` }
  });

  // Read data from channel as the user
  const results = await userClient.read(channelAddress);

  console.log('Read data: ', JSON.stringify(results, null, 4));

  // Validate data read from the channel. This validation will pass since the data is freshly read from the tangle an was not manipulated
  const validationResult = await userClient.validate(channelAddress, results);

  console.log('Validation result: ', validationResult);

  // Manipulate the data
  const tamperedResult = { log: 'This log is not the original' };
  results[0].log.payload = tamperedResult;

  // Now try to validate the manipulated data
  const validationResult2 = await userClient.validate(channelAddress, results);

  // If the validation fails like in this case the original data is included in the validation result
  console.log(
    'Validation result with manipulated data: ',
    JSON.stringify(validationResult2, null, 4)
  );
}

searchChannelAndValidateData();
```

## API Documentation

# Enumeration: AccessRights

## Table of contents

### Enumeration Members

- [Audit](AccessRights.md#audit)
- [Read](AccessRights.md#read)
- [ReadAndWrite](AccessRights.md#readandwrite)
- [Write](AccessRights.md#write)

## Enumeration Members

### Audit

• **Audit** = ``"Audit"``

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/schemas/subscription.d.ts:6

___

### Read

• **Read** = ``"Read"``

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/schemas/subscription.d.ts:7

___

### ReadAndWrite

• **ReadAndWrite** = ``"ReadAndWrite"``

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/schemas/subscription.d.ts:9

___

### Write

• **Write** = ``"Write"``

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/schemas/subscription.d.ts:8

# Enumeration: CredentialTypes

## Table of contents

### Enumeration Members

- [BasicIdentityCredential](CredentialTypes.md#basicidentitycredential)
- [VerifiedIdentityCredential](CredentialTypes.md#verifiedidentitycredential)

## Enumeration Members

### BasicIdentityCredential

• **BasicIdentityCredential** = ``"BasicIdentityCredential"``

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/verification.d.ts:8

___

### VerifiedIdentityCredential

• **VerifiedIdentityCredential** = ``"VerifiedIdentityCredential"``

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/verification.d.ts:7

# Enumeration: UserType

## Table of contents

### Enumeration Members

- [Device](UserType.md#device)
- [Organization](UserType.md#organization)
- [Person](UserType.md#person)
- [Product](UserType.md#product)
- [Service](UserType.md#service)
- [Unknown](UserType.md#unknown)

## Enumeration Members

### Device

• **Device** = ``"Device"``

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/user.d.ts:18

___

### Organization

• **Organization** = ``"Organization"``

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/user.d.ts:15

___

### Person

• **Person** = ``"Person"``

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/user.d.ts:17

___

### Product

• **Product** = ``"Product"``

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/user.d.ts:19

___

### Service

• **Service** = ``"Service"``

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/user.d.ts:16

___

### Unknown

• **Unknown** = ``"Unknown"``

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/user.d.ts:20


# Class: ChannelClient

## Hierarchy

- `BaseClient`

  ↳ **`ChannelClient`**

## Table of contents

### Constructors

- [constructor](ChannelClient.md#constructor)

### Properties

- [apiKey](ChannelClient.md#apikey)
- [auditTrailUrl](ChannelClient.md#audittrailurl)
- [baseUrl](ChannelClient.md#baseurl)
- [instance](ChannelClient.md#instance)
- [isGatewayUrl](ChannelClient.md#isgatewayurl)
- [jwtToken](ChannelClient.md#jwttoken)
- [ssiBridgeUrl](ChannelClient.md#ssibridgeurl)
- [useGatewayUrl](ChannelClient.md#usegatewayurl)
- [apiVersionAuditTrail] (ChannelClient.md#apiVersionAuditTrail)
- [apiVersionSsiBridge] (ChannelClient.md#apiVersionSsiBridge)

### Methods

- [add](ChannelClient.md#add)
- [addSubscription](ChannelClient.md#addsubscription)
- [authenticate](ChannelClient.md#authenticate)
- [authorizeSubscription](ChannelClient.md#authorizesubscription)
- [buildUrls](ChannelClient.md#buildurls)
- [create](ChannelClient.md#create)
- [delete](ChannelClient.md#delete)
- [findAllSubscriptions](ChannelClient.md#findallsubscriptions)
- [findSubscription](ChannelClient.md#findsubscription)
- [get](ChannelClient.md#get)
- [getHexEncodedKey](ChannelClient.md#gethexencodedkey)
- [hashNonce](ChannelClient.md#hashnonce)
- [info](ChannelClient.md#info)
- [post](ChannelClient.md#post)
- [put](ChannelClient.md#put)
- [read](ChannelClient.md#read)
- [readHistory](ChannelClient.md#readhistory)
- [reimport](ChannelClient.md#reimport)
- [remove](ChannelClient.md#remove)
- [removeSubscription](ChannelClient.md#removesubscription)
- [requestSubscription](ChannelClient.md#requestsubscription)
- [revokeSubscription](ChannelClient.md#revokesubscription)
- [search](ChannelClient.md#search)
- [signNonce](ChannelClient.md#signnonce)
- [update](ChannelClient.md#update)
- [updateSubscription](ChannelClient.md#updatesubscription)
- [validate](ChannelClient.md#validate)
- [write](ChannelClient.md#write)

## Constructors

### constructor

• **new ChannelClient**(`config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ClientConfig`](../modules.md#clientconfig) |

#### Overrides

BaseClient.constructor

## Properties

### apiKey

• **apiKey**: `string`

#### Inherited from

BaseClient.apiKey

#### Defined in

[src/clients/base.ts:14](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L14)

___

### auditTrailUrl

• `Optional` **auditTrailUrl**: `string`

#### Inherited from

BaseClient.auditTrailUrl

#### Defined in

[src/clients/base.ts:17](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L17)

___

### baseUrl

• `Private` **baseUrl**: `string`

#### Defined in

[src/clients/channel.ts:28](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/channel.ts#L28)

___

### instance

• **instance**: `AxiosInstance`

#### Inherited from

BaseClient.instance

#### Defined in

[src/clients/base.ts:20](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L20)

___

### isGatewayUrl

• **isGatewayUrl**: `string`

#### Inherited from

BaseClient.isGatewayUrl

#### Defined in

[src/clients/base.ts:15](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L15)

___

### jwtToken

• `Optional` **jwtToken**: `string`

#### Inherited from

BaseClient.jwtToken

#### Defined in

[src/clients/base.ts:19](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L19)

___

### ssiBridgeUrl

• `Optional` **ssiBridgeUrl**: `string`

#### Inherited from

BaseClient.ssiBridgeUrl

#### Defined in

[src/clients/base.ts:18](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L18)

___

### useGatewayUrl

• `Optional` **useGatewayUrl**: `boolean`

#### Inherited from

BaseClient.useGatewayUrl

#### Defined in

[src/clients/base.ts:16](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L16)

–––

### apiVersionAuditTrail

• `Optional` **apiVersionAuditTrail**: `string`

#### Inherited from

BaseClient.apiVersionAuditTrail

#### Defined in

[src/clients/base.ts:18](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L18)

–––

### apiVersionSsiBridge

• `Optional` **apiVersionSsiBridge**: `string`

#### Inherited from

BaseClient.apiVersionSsiBridge

#### Defined in

[src/clients/base.ts:19](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L19)


## Methods

### add

▸ **add**(`channel`): `Promise`<``null``\>

Add an existing channel into the database. Clients are able to add existing channels into the database so others can subscribe to them. This will be automatically called when a channel will be created.

#### Parameters

| Name | Type |
| :------ | :------ |
| `channel` | `Object` |
| `channel.authorId` | `string` |
| `channel.channelAddress` | `string` |
| `channel.created` | `undefined` \| `string` |
| `channel.description` | `undefined` \| `string` |
| `channel.latestMessage` | `undefined` \| `string` |
| `channel.name` | `string` |
| `channel.requestedSubscriptionIds` | `undefined` \| `StaticArray`<`TString`\> |
| `channel.subscriberIds` | `undefined` \| `StaticArray`<`TString`\> |
| `channel.topics` | `StaticArray`<`TObject`<{ `source`: `TString` ; `type`: `TString`  }\>\> |
| `channel.type` | `undefined` \| `ChannelType` |

#### Returns

`Promise`<``null``\>

___

### addSubscription

▸ **addSubscription**(`channelAddress`, `id`, `subscription`): `Promise`<{ `accessRights`: [`AccessRights`](../enums/AccessRights.md) ; `channelAddress`: `string` ; `id`: `string` ; `isAuthorized`: `boolean` ; `keyloadLink`: `undefined` \| `string` ; `pskId`: `undefined` \| `string` ; `publicKey`: `undefined` \| `string` ; `sequenceLink`: `undefined` \| `string` ; `state`: `string` ; `subscriptionLink`: `undefined` \| `string` ; `type`: `SubscriptionType`  }\>

Adds an existing subscription (e.g. the subscription was not created with the api but locally.)

#### Parameters

| Name | Type |
| :------ | :------ |
| `channelAddress` | `string` |
| `id` | `string` |
| `subscription` | `Object` |
| `subscription.accessRights` | [`AccessRights`](../enums/AccessRights.md) |
| `subscription.channelAddress` | `string` |
| `subscription.id` | `string` |
| `subscription.isAuthorized` | `boolean` |
| `subscription.keyloadLink` | `undefined` \| `string` |
| `subscription.pskId` | `undefined` \| `string` |
| `subscription.publicKey` | `undefined` \| `string` |
| `subscription.sequenceLink` | `undefined` \| `string` |
| `subscription.state` | `string` |
| `subscription.subscriptionLink` | `undefined` \| `string` |
| `subscription.type` | `SubscriptionType` |

#### Returns

`Promise`<{ `accessRights`: [`AccessRights`](../enums/AccessRights.md) ; `channelAddress`: `string` ; `id`: `string` ; `isAuthorized`: `boolean` ; `keyloadLink`: `undefined` \| `string` ; `pskId`: `undefined` \| `string` ; `publicKey`: `undefined` \| `string` ; `sequenceLink`: `undefined` \| `string` ; `state`: `string` ; `subscriptionLink`: `undefined` \| `string` ; `type`: `SubscriptionType`  }\>

___

### authenticate

▸ **authenticate**(`id`, `secretKey`): `Promise`<`void`\>

Authenticates the user to the api for requests where authentication is needed

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | of the user to authenticate |
| `secretKey` | `string` | of the user to authenticate |

#### Returns

`Promise`<`void`\>

#### Inherited from

BaseClient.authenticate

___

### authorizeSubscription

▸ **authorizeSubscription**(`channelAddress`, `subscriptionIdentifier`): `Promise`<{ `keyloadLink`: `string`  }\>

Authorize a subscription to a channel with DID or subscription link. The author of a channel can authorize a subscriber to read/write from a channel. Eventually after verifying its identity (using the SSI Bridge).

#### Parameters

| Name | Type |
| :------ | :------ |
| `channelAddress` | `string` |
| `subscriptionIdentifier` | `Object` |
| `subscriptionIdentifier.id` | `undefined` \| `string` |
| `subscriptionIdentifier.subscriptionLink` | `undefined` \| `string` |

#### Returns

`Promise`<{ `keyloadLink`: `string`  }\>

keyloadLink

___

### buildUrls

▸ **buildUrls**(`useGatewayUrl?`, `ssiBridgeUrl?`, `auditTrailUrl?`, `apiVersion?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `useGatewayUrl?` | `boolean` |
| `ssiBridgeUrl?` | `string` |
| `auditTrailUrl?` | `string` |

#### Returns

`void`

#### Inherited from

BaseClient.buildUrls

___

### create

▸ **create**(`data`): `Promise`<{ `channelAddress`: `string` ; `presharedKey`: `undefined` \| `string` ; `seed`: `undefined` \| `string`  }\>

Create a new channel. An author can create a new channel with specific topics where other clients can subscribe to.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |
| `data.description` | `undefined` \| `string` |
| `data.hasPresharedKey` | `undefined` \| `boolean` |
| `data.name` | `undefined` \| `string` |
| `data.presharedKey` | `undefined` \| `string` |
| `data.seed` | `undefined` \| `string` |
| `data.topics` | `StaticArray`<`TObject`<{ `source`: `TString` ; `type`: `TString`  }\>\> |
| `data.type` | `undefined` \| `ChannelType` |

#### Returns

`Promise`<{ `channelAddress`: `string` ; `presharedKey`: `undefined` \| `string` ; `seed`: `undefined` \| `string`  }\>

___

### delete

▸ **delete**(`url`, `params?`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `params` | `any` |

#### Returns

`Promise`<`any`\>

#### Inherited from

BaseClient.delete

___

### findAllSubscriptions

▸ **findAllSubscriptions**(`channelAddress`, `isAuthorized?`): `Promise`<{ `accessRights`: [`AccessRights`](../enums/AccessRights.md) ; `channelAddress`: `string` ; `id`: `string` ; `isAuthorized`: `boolean` ; `keyloadLink`: `undefined` \| `string` ; `pskId`: `undefined` \| `string` ; `publicKey`: `undefined` \| `string` ; `sequenceLink`: `undefined` \| `string` ; `state`: `string` ; `subscriptionLink`: `undefined` \| `string` ; `type`: `SubscriptionType`  }[]\>

Get all subscriptions of a channel. Use the is-authorized query parameter to filter for authorized subscriptions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `channelAddress` | `string` |
| `isAuthorized?` | `boolean` |

#### Returns

`Promise`<{ `accessRights`: [`AccessRights`](../enums/AccessRights.md) ; `channelAddress`: `string` ; `id`: `string` ; `isAuthorized`: `boolean` ; `keyloadLink`: `undefined` \| `string` ; `pskId`: `undefined` \| `string` ; `publicKey`: `undefined` \| `string` ; `sequenceLink`: `undefined` \| `string` ; `state`: `string` ; `subscriptionLink`: `undefined` \| `string` ; `type`: `SubscriptionType`  }[]\>

___

### findSubscription

▸ **findSubscription**(`channelAddress`, `id`): `Promise`<{ `accessRights`: [`AccessRights`](../enums/AccessRights.md) ; `channelAddress`: `string` ; `id`: `string` ; `isAuthorized`: `boolean` ; `keyloadLink`: `undefined` \| `string` ; `pskId`: `undefined` \| `string` ; `publicKey`: `undefined` \| `string` ; `sequenceLink`: `undefined` \| `string` ; `state`: `string` ; `subscriptionLink`: `undefined` \| `string` ; `type`: `SubscriptionType`  }\>

Get a subscription of a channel by identity id.

#### Parameters

| Name | Type |
| :------ | :------ |
| `channelAddress` | `string` |
| `id` | `string` |

#### Returns

`Promise`<{ `accessRights`: [`AccessRights`](../enums/AccessRights.md) ; `channelAddress`: `string` ; `id`: `string` ; `isAuthorized`: `boolean` ; `keyloadLink`: `undefined` \| `string` ; `pskId`: `undefined` \| `string` ; `publicKey`: `undefined` \| `string` ; `sequenceLink`: `undefined` \| `string` ; `state`: `string` ; `subscriptionLink`: `undefined` \| `string` ; `type`: `SubscriptionType`  }\>

___

### get

▸ **get**(`url`, `params?`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `params` | `any` |

#### Returns

`Promise`<`any`\>

#### Inherited from

BaseClient.get

___

### getHexEncodedKey

▸ **getHexEncodedKey**(`base58Key`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `base58Key` | `string` |

#### Returns

`string`

#### Inherited from

BaseClient.getHexEncodedKey

___

### hashNonce

▸ **hashNonce**(`nonce`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `nonce` | `string` |

#### Returns

`string`

#### Inherited from

BaseClient.hashNonce

___

### info

▸ **info**(`address`): `Promise`<{ `authorId`: `string` ; `channelAddress`: `string` ; `created`: `undefined` \| `string` ; `description`: `undefined` \| `string` ; `latestMessage`: `undefined` \| `string` ; `name`: `string` ; `requestedSubscriptionIds`: `undefined` \| `StaticArray`<`TString`\> ; `subscriberIds`: `undefined` \| `StaticArray`<`TString`\> ; `topics`: `StaticArray`<`TObject`<{ `source`: `TString` ; `type`: `TString`  }\>\> ; `type`: `undefined` \| `ChannelType`  }\>

Get information about a channel with address channel-address.

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |

#### Returns

`Promise`<{ `authorId`: `string` ; `channelAddress`: `string` ; `created`: `undefined` \| `string` ; `description`: `undefined` \| `string` ; `latestMessage`: `undefined` \| `string` ; `name`: `string` ; `requestedSubscriptionIds`: `undefined` \| `StaticArray`<`TString`\> ; `subscriberIds`: `undefined` \| `StaticArray`<`TString`\> ; `topics`: `StaticArray`<`TObject`<{ `source`: `TString` ; `type`: `TString`  }\>\> ; `type`: `undefined` \| `ChannelType`  }\>

___

### post

▸ **post**(`url`, `data`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `data` | `any` |

#### Returns

`Promise`<`any`\>

#### Inherited from

BaseClient.post

___

### put

▸ **put**(`url`, `data`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `data` | `any` |

#### Returns

`Promise`<`any`\>

#### Inherited from

BaseClient.put

___

### read

▸ **read**(`channelAddress`, `channelOptions?`): `Promise`<{ `imported`: `undefined` \| `string` ; `link`: `string` ; `log`: { created?: string \| undefined; type?: string \| undefined; metadata?: any; publicPayload?: any; payload?: any; } ; `messageId`: `undefined` \| `string` ; `source`: `undefined` \| { id?: string \| undefined; publicKey?: string \| undefined; }  }[]\>

Get data from the channel with address channel address. The first possible message a subscriber can receive is the time the subscription got approved all messages before are not received. Read permission is mandatory.

#### Parameters

| Name | Type |
| :------ | :------ |
| `channelAddress` | `string` |
| `channelOptions?` | `Object` |
| `channelOptions.asc?` | `boolean` |
| `channelOptions.endDate?` | `Date` |
| `channelOptions.index?` | `number` |
| `channelOptions.limit?` | `number` |
| `channelOptions.startDate?` | `Date` |

#### Returns

`Promise`<{ `imported`: `undefined` \| `string` ; `link`: `string` ; `log`: { created?: string \| undefined; type?: string \| undefined; metadata?: any; publicPayload?: any; payload?: any; } ; `messageId`: `undefined` \| `string` ; `source`: `undefined` \| { id?: string \| undefined; publicKey?: string \| undefined; }  }[]\>

___

### readHistory

▸ **readHistory**(`channelAddress`, `presharedKey`, `type?`): `Promise`<{ `imported`: `undefined` \| `string` ; `link`: `string` ; `log`: { created?: string \| undefined; type?: string \| undefined; metadata?: any; publicPayload?: any; payload?: any; } ; `messageId`: `undefined` \| `string` ; `source`: `undefined` \| { id?: string \| undefined; publicKey?: string \| undefined; }  }[]\>

Get all data of a channel using a shared key (in case of encrypted channels). Mainly used from auditors to evaluate a log stream.

#### Parameters

| Name | Type |
| :------ | :------ |
| `channelAddress` | `string` |
| `presharedKey` | `string` |
| `type?` | `ChannelType` |

#### Returns

`Promise`<{ `imported`: `undefined` \| `string` ; `link`: `string` ; `log`: { created?: string \| undefined; type?: string \| undefined; metadata?: any; publicPayload?: any; payload?: any; } ; `messageId`: `undefined` \| `string` ; `source`: `undefined` \| { id?: string \| undefined; publicKey?: string \| undefined; }  }[]\>

___

### reimport

▸ **reimport**(`address`, `data`): `Promise`<``null``\>

The user can decide to re-import the data from the Tangle into the database. A reason for it could be a malicious state of the data.

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `data` | `Object` |
| `data.seed` | `undefined` \| `string` |
| `data.subscriptionPassword` | `undefined` \| `string` |

#### Returns

`Promise`<``null``\>

___

### remove

▸ **remove**(`address`): `Promise`<``null``\>

Delete information of a channel with address channel-address. The author of a channel can delete its entry in the database. In this case all subscriptions will be deleted and the channel won’t be found in the system anymore. The data & channel won’t be deleted from the IOTA Tangle since its data is immutable on the tangle!

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |

#### Returns

`Promise`<``null``\>

___

### removeSubscription

▸ **removeSubscription**(`channelAddress`, `id`): `Promise`<``null``\>

Deletes an existing subscription.

#### Parameters

| Name | Type |
| :------ | :------ |
| `channelAddress` | `string` |
| `id` | `string` |

#### Returns

`Promise`<``null``\>

___

### requestSubscription

▸ **requestSubscription**(`channelAddress`, `options?`): `Promise`<{ `seed`: `string` ; `subscriptionLink`: `string`  }\>

Request subscription to a channel with address channel-address. A client can request a subscription to a channel which it then is able to read/write from.

#### Parameters

| Name | Type |
| :------ | :------ |
| `channelAddress` | `string` |
| `options?` | `Object` |
| `options.accessRights` | `undefined` \| [`AccessRights`](../enums/AccessRights.md) |
| `options.presharedKey` | `undefined` \| `string` |
| `options.seed` | `undefined` \| `string` |

#### Returns

`Promise`<{ `seed`: `string` ; `subscriptionLink`: `string`  }\>

___

### revokeSubscription

▸ **revokeSubscription**(`channelAddress`, `subscriptionIdentifier`): `Promise`<``null``\>

Revoke subscription to a channel. Only the author of a channel can revoke a subscription from a channel.

#### Parameters

| Name | Type |
| :------ | :------ |
| `channelAddress` | `string` |
| `subscriptionIdentifier` | `Object` |
| `subscriptionIdentifier.id` | `undefined` \| `string` |
| `subscriptionIdentifier.subscriptionLink` | `undefined` \| `string` |

#### Returns

`Promise`<``null``\>

___

### search

▸ **search**(`searchCriteria`): `Promise`<{ `authorId`: `string` ; `channelAddress`: `string` ; `created`: `undefined` \| `string` ; `description`: `undefined` \| `string` ; `latestMessage`: `undefined` \| `string` ; `name`: `string` ; `requestedSubscriptionIds`: `undefined` \| `StaticArray`<`TString`\> ; `subscriberIds`: `undefined` \| `StaticArray`<`TString`\> ; `topics`: `StaticArray`<`TObject`<{ `source`: `TString` ; `type`: `TString`  }\>\> ; `type`: `undefined` \| `ChannelType`  }[]\>

Search for a channel. A client can search for a channel which it is interested in.

#### Parameters

| Name | Type |
| :------ | :------ |
| `searchCriteria` | [`ChannelInfoSearch`](../modules.md#channelinfosearch) |

#### Returns

`Promise`<{ `authorId`: `string` ; `channelAddress`: `string` ; `created`: `undefined` \| `string` ; `description`: `undefined` \| `string` ; `latestMessage`: `undefined` \| `string` ; `name`: `string` ; `requestedSubscriptionIds`: `undefined` \| `StaticArray`<`TString`\> ; `subscriberIds`: `undefined` \| `StaticArray`<`TString`\> ; `topics`: `StaticArray`<`TObject`<{ `source`: `TString` ; `type`: `TString`  }\>\> ; `type`: `undefined` \| `ChannelType`  }[]\>

___

### signNonce

▸ **signNonce**(`privateKey`, `nonce`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `privateKey` | `string` |
| `nonce` | `string` |

#### Returns

`Promise`<`string`\>

#### Inherited from

BaseClient.signNonce

___

### update

▸ **update**(`channel`): `Promise`<``null``\>

Update channel information. The author of a channel can update topics of a channel.

#### Parameters

| Name | Type |
| :------ | :------ |
| `channel` | `Object` |
| `channel.authorId` | `string` |
| `channel.channelAddress` | `string` |
| `channel.created` | `undefined` \| `string` |
| `channel.description` | `undefined` \| `string` |
| `channel.latestMessage` | `undefined` \| `string` |
| `channel.name` | `string` |
| `channel.requestedSubscriptionIds` | `undefined` \| `StaticArray`<`TString`\> |
| `channel.subscriberIds` | `undefined` \| `StaticArray`<`TString`\> |
| `channel.topics` | `StaticArray`<`TObject`<{ `source`: `TString` ; `type`: `TString`  }\>\> |
| `channel.type` | `undefined` \| `ChannelType` |

#### Returns

`Promise`<``null``\>

___

### updateSubscription

▸ **updateSubscription**(`channelAddress`, `id`, `updatedSubscription`): `Promise`<``null``\>

Updates an existing subscription.

#### Parameters

| Name | Type |
| :------ | :------ |
| `channelAddress` | `string` |
| `id` | `string` |
| `updatedSubscription` | `Object` |
| `updatedSubscription.accessRights` | `undefined` \| [`AccessRights`](../enums/AccessRights.md) |
| `updatedSubscription.channelAddress` | `undefined` \| `string` |
| `updatedSubscription.id` | `undefined` \| `string` |
| `updatedSubscription.isAuthorized` | `undefined` \| `boolean` |
| `updatedSubscription.keyloadLink` | `undefined` \| `string` |
| `updatedSubscription.pskId` | `undefined` \| `string` |
| `updatedSubscription.publicKey` | `undefined` \| `string` |
| `updatedSubscription.sequenceLink` | `undefined` \| `string` |
| `updatedSubscription.state` | `undefined` \| `string` |
| `updatedSubscription.subscriptionLink` | `undefined` \| `string` |
| `updatedSubscription.type` | `undefined` \| `SubscriptionType` |

#### Returns

`Promise`<``null``\>

___

### validate

▸ **validate**(`address`, `data`): `Promise`<`StaticArray`<`TObject`<{ `error`: `TOptional`<`TString`\> ; `isValid`: `TBoolean` ; `link`: `TString` ; `tangleLog`: `TOptional`<`TAny`\>  }\>\>\>

Validates channel data by comparing the log of each link with the data on the tangle.

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `data` | `StaticArray`<`TObject`<{ `imported`: `TOptional`<`TString`\> ; `link`: `TString` ; `log`: `TObject`<{ `created`: `TOptional`<`TString`\> ; `metadata`: `TOptional`<`TAny`\> ; `payload`: `TOptional`<`TAny`\> ; `publicPayload`: `TOptional`<`TAny`\> ; `type`: `TOptional`<`TString`\>  }\> ; `messageId`: `TOptional`<`TString`\> ; `source`: `TOptional`<`TObject`<{ `id`: `TOptional`<`TString`\> ; `publicKey`: `TOptional`<`TString`\>  }\>\>  }\>\> |

#### Returns

`Promise`<`StaticArray`<`TObject`<{ `error`: `TOptional`<`TString`\> ; `isValid`: `TBoolean` ; `link`: `TString` ; `tangleLog`: `TOptional`<`TAny`\>  }\>\>\>

___

### write

▸ **write**(`address`, `data`): `Promise`<{ `imported`: `undefined` \| `string` ; `link`: `string` ; `log`: { created?: string \| undefined; type?: string \| undefined; metadata?: any; publicPayload?: any; payload?: any; } ; `messageId`: `undefined` \| `string` ; `source`: `undefined` \| { id?: string \| undefined; publicKey?: string \| undefined; }  }\>

Write data to a channel with address channel address. Write permission is mandatory. The type and metadata fields are not encrypted to have a possibility to search for events. The payload is stored encrypted for encrypted channels.

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `data` | `Object` |
| `data.created` | `undefined` \| `string` |
| `data.metadata` | `any` |
| `data.payload` | `any` |
| `data.publicPayload` | `any` |
| `data.type` | `undefined` \| `string` |

#### Returns

`Promise`<{ `imported`: `undefined` \| `string` ; `link`: `string` ; `log`: { created?: string \| undefined; type?: string \| undefined; metadata?: any; publicPayload?: any; payload?: any; } ; `messageId`: `undefined` \| `string` ; `source`: `undefined` \| { id?: string \| undefined; publicKey?: string \| undefined; }  }\>

# Class: IdentityClient

## Hierarchy

- `BaseClient`

  ↳ **`IdentityClient`**

## Table of contents

### Constructors

- [constructor](IdentityClient.md#constructor)

### Properties

- [apiKey](IdentityClient.md#apikey)
- [auditTrailUrl](IdentityClient.md#audittrailurl)
- [baseUrl](IdentityClient.md#baseurl)
- [instance](IdentityClient.md#instance)
- [isGatewayUrl](IdentityClient.md#isgatewayurl)
- [jwtToken](IdentityClient.md#jwttoken)
- [ssiBridgeUrl](IdentityClient.md#ssibridgeurl)
- [useGatewayUrl](IdentityClient.md#usegatewayurl)
- [apiVersionAuditTrail] (IdentityClient.md#apiVersionAuditTrail)
- [apiVersionSsiBridge] (IdentityClient.md#apiVersionSsiBridge)

### Methods

- [add](IdentityClient.md#add)
- [addTrustedAuthority](IdentityClient.md#addtrustedauthority)
- [authenticate](IdentityClient.md#authenticate)
- [buildUrls](IdentityClient.md#buildurls)
- [checkCredential](IdentityClient.md#checkcredential)
- [create](IdentityClient.md#create)
- [createCredential](IdentityClient.md#createcredential)
- [delete](IdentityClient.md#delete)
- [find](IdentityClient.md#find)
- [get](IdentityClient.md#get)
- [getHexEncodedKey](IdentityClient.md#gethexencodedkey)
- [getTrustedAuthorities](IdentityClient.md#gettrustedauthorities)
- [hashNonce](IdentityClient.md#hashnonce)
- [latestDocument](IdentityClient.md#latestdocument)
- [post](IdentityClient.md#post)
- [put](IdentityClient.md#put)
- [remove](IdentityClient.md#remove)
- [removeTrustedAuthority](IdentityClient.md#removetrustedauthority)
- [revokeCredential](IdentityClient.md#revokecredential)
- [search](IdentityClient.md#search)
- [signNonce](IdentityClient.md#signnonce)
- [update](IdentityClient.md#update)
- [verifyJwt](IdentityClient.md#verifyjwt)

## Constructors

### constructor

• **new IdentityClient**(`config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ClientConfig`](../modules.md#clientconfig) |

#### Overrides

BaseClient.constructor

## Properties

### apiKey

• **apiKey**: `string`

#### Inherited from

BaseClient.apiKey

#### Defined in

[src/clients/base.ts:13](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L13)

___

### auditTrailUrl

• `Optional` **auditTrailUrl**: `string`

#### Inherited from

BaseClient.auditTrailUrl

#### Defined in

[src/clients/base.ts:16](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L16)

___

### baseUrl

• `Private` **baseUrl**: `string`

#### Defined in

[src/clients/identity.ts:18](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/identity.ts#L18)

___

### instance

• **instance**: `AxiosInstance`

#### Inherited from

BaseClient.instance

#### Defined in

[src/clients/base.ts:21](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L21)

___

### isGatewayUrl

• **isGatewayUrl**: `string`

#### Inherited from

BaseClient.isGatewayUrl

#### Defined in

[src/clients/base.ts:14](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L14)

___

### jwtToken

• `Optional` **jwtToken**: `string`

#### Inherited from

BaseClient.jwtToken

#### Defined in

[src/clients/base.ts:20](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L20)

___

### ssiBridgeUrl

• `Optional` **ssiBridgeUrl**: `string`

#### Inherited from

BaseClient.ssiBridgeUrl

#### Defined in

[src/clients/base.ts:17](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L17)

___

### useGatewayUrl

• `Optional` **useGatewayUrl**: `boolean`

#### Inherited from

BaseClient.useGatewayUrl

#### Defined in

[src/clients/base.ts:15](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L15)

–––

### apiVersionAuditTrail

• `Optional` **apiVersionAuditTrail**: `string`

#### Inherited from

BaseClient.apiVersionAuditTrail

#### Defined in

[src/clients/base.ts:18](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L18)

–––

### apiVersionSsiBridge

• `Optional` **apiVersionSsiBridge**: `string`

#### Inherited from

BaseClient.apiVersionSsiBridge

#### Defined in

[src/clients/base.ts:19](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/clients/base.ts#L19)

## Methods

### add

▸ **add**(`identity`): `Promise`<``null``\>

Register an existing identity into the Bridge. This can be used if the identity already exists or it was only created locally. Registering an identity in the Bridge makes it possible to search for it by using some of the identity attributes, i.e., the username.

#### Parameters

| Name | Type |
| :------ | :------ |
| `identity` | `Object` |
| `identity.claim` | `undefined` \| { type: string; } |
| `identity.creator` | `undefined` \| `string` |
| `identity.id` | `string` |
| `identity.isPrivate` | `undefined` \| `boolean` |
| `identity.isServerIdentity` | `undefined` \| `boolean` |
| `identity.registrationDate` | `undefined` \| `string` |
| `identity.role` | `undefined` \| `string` |
| `identity.username` | `string` |
| `identity.verifiableCredentials` | `undefined` \| `StaticArray`<`TObject`<{ `@context`: `TString` ; `credentialSubject`: `TObject`<{ `id`: `TString` ; `initiatorId`: `TOptional`<`TString`\> ; `type`: `TString`  }\> ; `id`: `TString` ; `issuanceDate`: `TString` ; `issuer`: `TString` ; `proof`: `TObject`<{ `signatureValue`: `TString` ; `type`: `TString` ; `verificationMethod`: `TString`  }\> ; `type`: `TArray`<`TString`\>  }\>\> |

#### Returns

`Promise`<``null``\>

___

### addTrustedAuthority

▸ **addTrustedAuthority**(`trustedRootId`): `Promise`<``null``\>

Adds Trusted Root identity identifiers (DIDs). Trusted roots are DIDs of identities which are trusted by the Bridge. This identity DIDs can be DIDs of other organizations. By adding them to the list Trusted Roots their Verifiable Credentials (VCs) are automatically trusted when checking at the Bridge.

#### Parameters

| Name | Type |
| :------ | :------ |
| `trustedRootId` | `string` |

#### Returns

`Promise`<``null``\>

___

### authenticate

▸ **authenticate**(`id`, `secretKey`): `Promise`<`void`\>

Authenticates the user to the api for requests where authentication is needed

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | of the user to authenticate |
| `secretKey` | `string` | of the user to authenticate |

#### Returns

`Promise`<`void`\>

#### Inherited from

BaseClient.authenticate

___

### buildUrls

▸ **buildUrls**(`useGatewayUrl?`, `ssiBridgeUrl?`, `auditTrailUrl?`, `apiVersion?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `useGatewayUrl?` | `boolean` |
| `ssiBridgeUrl?` | `string` |
| `auditTrailUrl?` | `string` |
| `apiVersion?` | [`ApiVersion`](../enums/ApiVersion.md) |

#### Returns

`void`

#### Inherited from

BaseClient.buildUrls

___

### checkCredential

▸ **checkCredential**(`credential`): `Promise`<{ `isVerified`: `boolean`  }\>

Check the verifiable credential of an identity. Validates the signed verifiable credential against the Issuer information stored onto the IOTA Tangle and checks if the issuer identity (DID) contained in the credential is from a trusted root.

#### Parameters

| Name | Type |
| :------ | :------ |
| `credential` | `Object` |
| `credential.@context` | `string` |
| `credential.credentialSubject` | { initiatorId?: string \| undefined; id: string; type: string; } |
| `credential.id` | `string` |
| `credential.issuanceDate` | `string` |
| `credential.issuer` | `string` |
| `credential.proof` | { verificationMethod: string; type: string; signatureValue: string; } |
| `credential.type` | `StaticArray`<`TString`\> |

#### Returns

`Promise`<{ `isVerified`: `boolean`  }\>

___

### create

▸ **create**(`username?`, `claimType?`, `claim?`): `Promise`<{ `doc`: { verificationMethod?: StaticArray<TObject<{ id: TString; controller: TString; type: TString; publicKeyBase58: TString; }\>\> \| undefined; ... 6 more ...; proof: { ...; }; } ; `key`: { type: string; public: string; secret: string; encoding: Encoding; }  }\>

Create a new decentralized digital identity (DID). Identity DID document is signed and published to the ledger (IOTA Tangle). A digital identity can represent an individual, an organization or an object. The privateAuthKey controlling the identity is returned. It is recommended to securely (encrypt) store the privateAuthKey locally, since it is not stored on the APIs Bridge.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `username?` | `string` | `undefined` |  |
| `claimType` | [`UserType`](../enums/UserType.md) | `UserType.Person` | defaults to UserType.Person |
| `claim?` | `any` | `undefined` |  |

#### Returns

`Promise`<{ `doc`: { verificationMethod?: StaticArray<TObject<{ id: TString; controller: TString; type: TString; publicKeyBase58: TString; }\>\> \| undefined; ... 6 more ...; proof: { ...; }; } ; `key`: { type: string; public: string; secret: string; encoding: Encoding; }  }\>

___

### createCredential

▸ **createCredential**(`initiatorVC`, `targetDid`, `credentialType`, `claimType`, `claim?`): `Promise`<{ `@context`: `string` ; `credentialSubject`: { initiatorId?: string \| undefined; id: string; type: string; } ; `id`: `string` ; `issuanceDate`: `string` ; `issuer`: `string` ; `proof`: { verificationMethod: string; type: string; signatureValue: string; } ; `type`: `StaticArray`<`TString`\>  }\>

Verify the authenticity of an identity (of an individual, organization or object) and issue a credential stating the identity verification status. Only previously verified identities (based on a network of trust) with assigned privileges can verify other identities. Having a verified identity provides the opportunity for other identities to identify and verify a the entity they interact to.

#### Parameters

| Name | Type |
| :------ | :------ |
| `initiatorVC` | `undefined` \| { `@context`: `string` ; `credentialSubject`: { initiatorId?: string \| undefined; id: string; type: string; } ; `id`: `string` ; `issuanceDate`: `string` ; `issuer`: `string` ; `proof`: { verificationMethod: string; type: string; signatureValue: string; } ; `type`: `StaticArray`<`TString`\>  } |
| `targetDid` | `string` |
| `credentialType` | `string` |
| `claimType` | [`UserType`](../enums/UserType.md) |
| `claim?` | `any` |

#### Returns

`Promise`<{ `@context`: `string` ; `credentialSubject`: { initiatorId?: string \| undefined; id: string; type: string; } ; `id`: `string` ; `issuanceDate`: `string` ; `issuer`: `string` ; `proof`: { verificationMethod: string; type: string; signatureValue: string; } ; `type`: `StaticArray`<`TString`\>  }\>

___

### delete

▸ **delete**(`url`, `params?`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `params` | `any` |

#### Returns

`Promise`<`any`\>

#### Inherited from

BaseClient.delete

___

### find

▸ **find**(`id`): `Promise`<{ `claim`: `undefined` \| { type: string; } ; `creator`: `undefined` \| `string` ; `id`: `string` ; `isPrivate`: `undefined` \| `boolean` ; `isServerIdentity`: `undefined` \| `boolean` ; `registrationDate`: `undefined` \| `string` ; `role`: `undefined` \| `string` ; `username`: `string` ; `verifiableCredentials`: `undefined` \| `StaticArray`<`TObject`<{ `@context`: `TString` ; `credentialSubject`: `TObject`<{ `id`: `TString` ; `initiatorId`: `TOptional`<`TString`\> ; `type`: `TString`  }\> ; `id`: `TString` ; `issuanceDate`: `TString` ; `issuer`: `TString` ; `proof`: `TObject`<{ `signatureValue`: `TString` ; `type`: `TString` ; `verificationMethod`: `TString`  }\> ; `type`: `TArray`<`TString`\>  }\>\>  }\>

Get information (including attached credentials) about a specific identity using the identity-id (DID identifier).

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<{ `claim`: `undefined` \| { type: string; } ; `creator`: `undefined` \| `string` ; `id`: `string` ; `isPrivate`: `undefined` \| `boolean` ; `isServerIdentity`: `undefined` \| `boolean` ; `registrationDate`: `undefined` \| `string` ; `role`: `undefined` \| `string` ; `username`: `string` ; `verifiableCredentials`: `undefined` \| `StaticArray`<`TObject`<{ `@context`: `TString` ; `credentialSubject`: `TObject`<{ `id`: `TString` ; `initiatorId`: `TOptional`<`TString`\> ; `type`: `TString`  }\> ; `id`: `TString` ; `issuanceDate`: `TString` ; `issuer`: `TString` ; `proof`: `TObject`<{ `signatureValue`: `TString` ; `type`: `TString` ; `verificationMethod`: `TString`  }\> ; `type`: `TArray`<`TString`\>  }\>\>  }\>

___

### get

▸ **get**(`url`, `params?`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `params` | `any` |

#### Returns

`Promise`<`any`\>

#### Inherited from

BaseClient.get

___

### getHexEncodedKey

▸ **getHexEncodedKey**(`base58Key`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `base58Key` | `string` |

#### Returns

`string`

#### Inherited from

BaseClient.getHexEncodedKey

___

### getTrustedAuthorities

▸ **getTrustedAuthorities**(): `Promise`<`string`[]\>

Returns a list of Trusted Root identity identifiers (DIDs). Trusted roots are DIDs of identities which are trusted by the Bridge. This identity DIDs can be DIDs of other organizations. By adding them to the list Trusted Roots their Verifiable Credentials (VCs) are automatically trusted when checking at the Bridge.

#### Returns

`Promise`<`string`[]\>

___

### hashNonce

▸ **hashNonce**(`nonce`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `nonce` | `string` |

#### Returns

`string`

#### Inherited from

BaseClient.hashNonce

___

### latestDocument

▸ **latestDocument**(`id`): `Promise`<{ `document`: { `authentication`: `StaticArray`<`TObject`<{ `controller`: `TString` ; `id`: `TString` ; `publicKeyBase58`: `TString` ; `type`: `TString`  }\>\> ; `created`: `string` ; `id`: `string` ; `immutable`: `boolean` ; `previousMessageId`: `undefined` \| `string` ; `proof`: { verificationMethod: string; type: string; signatureValue: string; } ; `updated`: `string` ; `verificationMethod`: `undefined` \| `StaticArray`<`TObject`<{ `controller`: `TString` ; `id`: `TString` ; `publicKeyBase58`: `TString` ; `type`: `TString`  }\>\>  } ; `messageId`: `string`  }\>

Get the latest version of an identity document (DID) from the IOTA Tangle.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<{ `document`: { `authentication`: `StaticArray`<`TObject`<{ `controller`: `TString` ; `id`: `TString` ; `publicKeyBase58`: `TString` ; `type`: `TString`  }\>\> ; `created`: `string` ; `id`: `string` ; `immutable`: `boolean` ; `previousMessageId`: `undefined` \| `string` ; `proof`: { verificationMethod: string; type: string; signatureValue: string; } ; `updated`: `string` ; `verificationMethod`: `undefined` \| `StaticArray`<`TObject`<{ `controller`: `TString` ; `id`: `TString` ; `publicKeyBase58`: `TString` ; `type`: `TString`  }\>\>  } ; `messageId`: `string`  }\>

___

### post

▸ **post**(`url`, `data`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `data` | `any` |

#### Returns

`Promise`<`any`\>

#### Inherited from

BaseClient.post

___

### put

▸ **put**(`url`, `data`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `data` | `any` |

#### Returns

`Promise`<`any`\>

#### Inherited from

BaseClient.put

___

### remove

▸ **remove**(`id`, `revokeCredentials?`): `Promise`<``null``\>

Removes an identity from the Bridge. An identity can only delete itself and is not able to delete other identities. Administrators are able to remove other identities. The identity cannot be removed from the immutable IOTA Tangle but only at the Bridge. Also the identity credentials will remain and the identity is still able to interact with other bridges.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `id` | `string` | `undefined` |
| `revokeCredentials` | `boolean` | `false` |

#### Returns

`Promise`<``null``\>

Null

___

### removeTrustedAuthority

▸ **removeTrustedAuthority**(`trustedAuthorityId`): `Promise`<``null``\>

Remove Trusted Root identity identifiers (DIDs). Trusted roots are DIDs of identities which are trusted by the Bridge. This identity DIDs can be DIDs of other organizations. By adding them to the list Trusted Roots their Verifiable Credentials (VCs) are automatically trusted when checking at the Bridge.

#### Parameters

| Name | Type |
| :------ | :------ |
| `trustedAuthorityId` | `string` |

#### Returns

`Promise`<``null``\>

___

### revokeCredential

▸ **revokeCredential**(`credential`): `Promise`<``null``\>

Revoke one specific verifiable credential of an identity. In the case of individual and organization identities the reason could be that the user has left the organization. Only organization admins (with verified identities) or the identity owner itself can do that.

#### Parameters

| Name | Type |
| :------ | :------ |
| `credential` | `Object` |
| `credential.signatureValue` | `string` |

#### Returns

`Promise`<``null``\>

___

### search

▸ **search**(`username`): `Promise`<{ `claim`: `undefined` \| { type: string; } ; `creator`: `undefined` \| `string` ; `id`: `string` ; `isPrivate`: `undefined` \| `boolean` ; `isServerIdentity`: `undefined` \| `boolean` ; `numberOfCredentials`: `number` ; `registrationDate`: `undefined` \| `string` ; `role`: `undefined` \| `string` ; `username`: `string`  }[]\>

Search for identities in the system and returns a list of existing identities.

#### Parameters

| Name | Type |
| :------ | :------ |
| `username` | [`SearchCriteria`](../modules.md#searchcriteria) |

#### Returns

`Promise`<{ `claim`: `undefined` \| { type: string; } ; `creator`: `undefined` \| `string` ; `id`: `string` ; `isPrivate`: `undefined` \| `boolean` ; `isServerIdentity`: `undefined` \| `boolean` ; `numberOfCredentials`: `number` ; `registrationDate`: `undefined` \| `string` ; `role`: `undefined` \| `string` ; `username`: `string`  }[]\>

___

### signNonce

▸ **signNonce**(`privateKey`, `nonce`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `privateKey` | `string` |
| `nonce` | `string` |

#### Returns

`Promise`<`string`\>

#### Inherited from

BaseClient.signNonce

___

### update

▸ **update**(`identity`): `Promise`<``null``\>

Update claim of a registered identity.

#### Parameters

| Name | Type |
| :------ | :------ |
| `identity` | `Object` |
| `identity.claim` | `undefined` \| { type: string; } |
| `identity.creator` | `undefined` \| `string` |
| `identity.id` | `string` |
| `identity.isPrivate` | `undefined` \| `boolean` |
| `identity.isServerIdentity` | `undefined` \| `boolean` |
| `identity.registrationDate` | `undefined` \| `string` |
| `identity.role` | `undefined` \| `string` |
| `identity.username` | `string` |
| `identity.verifiableCredentials` | `undefined` \| `StaticArray`<`TObject`<{ `@context`: `TString` ; `credentialSubject`: `TObject`<{ `id`: `TString` ; `initiatorId`: `TOptional`<`TString`\> ; `type`: `TString`  }\> ; `id`: `TString` ; `issuanceDate`: `TString` ; `issuer`: `TString` ; `proof`: `TObject`<{ `signatureValue`: `TString` ; `type`: `TString` ; `verificationMethod`: `TString`  }\> ; `type`: `TArray`<`TString`\>  }\>\> |

#### Returns

`Promise`<``null``\>

___

### verifyJwt

▸ **verifyJwt**(`jwt`): `Promise`<{ `error?`: `string` ; `isValid`: `boolean`  }\>

Check the verifiable credential of an identity. Validates the signed verifiable credential against the Issuer information stored onto the IOTA Tangle and checks if the issuer identity (DID) contained in the credential is from a trusted root.

#### Parameters

| Name | Type |
| :------ | :------ |
| `jwt` | `Object` |
| `jwt.jwt` | `string` |

#### Returns

`Promise`<{ `error?`: `string` ; `isValid`: `boolean`  }\>


### Types


- [AddChannelLogBody](modules.md#addchannellogbody)
- [AuthorizeSubscriptionBody](modules.md#authorizesubscriptionbody)
- [AuthorizeSubscriptionResponse](modules.md#authorizesubscriptionresponse)
- [ChannelData](modules.md#channeldata)
- [ChannelInfo](modules.md#channelinfo)
- [ChannelInfoSearch](modules.md#channelinfosearch)
- [ClientConfig](modules.md#clientconfig)
- [CreateChannelBody](modules.md#createchannelbody)
- [CreateChannelResponse](modules.md#createchannelresponse)
- [IdentityDocumentJson](modules.md#identitydocumentjson)
- [IdentityInternal](modules.md#identityinternal)
- [IdentityJson](modules.md#identityjson)
- [ReimportBody](modules.md#reimportbody)
- [RequestSubscriptionBody](modules.md#requestsubscriptionbody)
- [RequestSubscriptionResponse](modules.md#requestsubscriptionresponse)
- [RevokeSubscriptionBody](modules.md#revokesubscriptionbody)
- [RevokeVerificationBody](modules.md#revokeverificationbody)
- [SearchCriteria](modules.md#searchcriteria)
- [Subscription](modules.md#subscription)
- [SubscriptionUpdate](modules.md#subscriptionupdate)
- [User](modules.md#user)
- [ValidateBody](modules.md#validatebody)
- [ValidateResponse](modules.md#validateresponse)
- [VerifiableCredentialInternal](modules.md#verifiablecredentialinternal)
- [VerifiableCredentialJson](modules.md#verifiablecredentialjson)

## Type Aliases

### AddChannelLogBody

Ƭ **AddChannelLogBody**: `Static`<typeof `AddChannelLogBodySchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/request-response-bodies.d.ts:16

___

### AuthorizeSubscriptionBody

Ƭ **AuthorizeSubscriptionBody**: `Static`<typeof `AuthorizeSubscriptionBodySchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/request-response-bodies.d.ts:20

___

### AuthorizeSubscriptionResponse

Ƭ **AuthorizeSubscriptionResponse**: `Static`<typeof `AuthorizeSubscriptionResponseSchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/request-response-bodies.d.ts:24

___

### ChannelData

Ƭ **ChannelData**: `Static`<typeof `ChannelDataSchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/channel-data.d.ts:4

___

### ChannelInfo

Ƭ **ChannelInfo**: `Static`<typeof `ChannelInfoSchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/channel-info.d.ts:4

___

### ChannelInfoSearch

Ƭ **ChannelInfoSearch**: `Omit`<`ChannelInfoSearchDate`, ``"created"`` \| ``"latestMessage"``\> & { `created?`: `Date` ; `latestMessage?`: `Date`  }

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/channel-info.d.ts:11

___

### ClientConfig

Ƭ **ClientConfig**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `apiKey?` | `string` |
| `auditTrailUrl?` | `string` |
| `isGatewayUrl?` | `string` |
| `ssiBridgeUrl?` | `string` |
| `useGatewayUrl?` | `boolean` |
| `apiVersionAuditTrail` | `string` |
| `apiVersionSsiBridge`| `string` |

#### Defined in

[src/models/clientConfig.ts:3](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/models/clientConfig.ts#L3)

___

### CreateChannelBody

Ƭ **CreateChannelBody**: `Static`<typeof `CreateChannelBodySchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/request-response-bodies.d.ts:14

___

### CreateChannelResponse

Ƭ **CreateChannelResponse**: `Static`<typeof `CreateChannelResponseSchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/request-response-bodies.d.ts:15

___

### IdentityDocumentJson

Ƭ **IdentityDocumentJson**: `Static`<typeof `IdentityDocumentJsonSchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/identity.d.ts:20

___

### IdentityInternal

Ƭ **IdentityInternal**: `Static`<typeof `IdentitySchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/identity.d.ts:16

___

### IdentityJson

Ƭ **IdentityJson**: `Static`<typeof `IdentityJsonSchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/identity.d.ts:22

___

### ReimportBody

Ƭ **ReimportBody**: `Static`<typeof `ReimportBodySchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/request-response-bodies.d.ts:17

___

### RequestSubscriptionBody

Ƭ **RequestSubscriptionBody**: `Static`<typeof `RequestSubscriptionBodySchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/request-response-bodies.d.ts:22

___

### RequestSubscriptionResponse

Ƭ **RequestSubscriptionResponse**: `Static`<typeof `RequestSubscriptionResponseSchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/request-response-bodies.d.ts:23

___

### RevokeSubscriptionBody

Ƭ **RevokeSubscriptionBody**: `Static`<typeof `RevokeSubscriptionBodySchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/request-response-bodies.d.ts:21

___

### RevokeVerificationBody

Ƭ **RevokeVerificationBody**: `Static`<typeof `RevokeVerificationBodySchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/request-response-bodies.d.ts:27

___

### SearchCriteria

Ƭ **SearchCriteria**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `asc?` | `boolean` |
| `creator?` | `string` |
| `index?` | `number` |
| `limit?` | `number` |
| `registrationDate?` | `Date` |
| `type?` | `string` |
| `username?` | `string` |

#### Defined in

[src/models/searchCriteria.ts:1](https://github.com/iotaledger/integration-services/blob/e09ee538/clients/client-sdk/src/models/searchCriteria.ts#L1)

___

### Subscription

Ƭ **Subscription**: `Static`<typeof `SubscriptionSchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/subscription.d.ts:3

___

### SubscriptionUpdate

Ƭ **SubscriptionUpdate**: `Static`<typeof `SubscriptionUpdateSchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/subscription.d.ts:4

___

### User

Ƭ **User**: `Static`<typeof `IdentitySchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/user.d.ts:7

___

### ValidateBody

Ƭ **ValidateBody**: `Static`<typeof `ValidateBodySchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/request-response-bodies.d.ts:18

___

### ValidateResponse

Ƭ **ValidateResponse**: `Static`<typeof `ValidateResponseSchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/request-response-bodies.d.ts:19

___

### VerifiableCredentialInternal

Ƭ **VerifiableCredentialInternal**: `Static`<typeof `VerifiableCredentialSchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/verification.d.ts:11

___

### VerifiableCredentialJson

Ƭ **VerifiableCredentialJson**: `Static`<typeof `VerifiableCredentialSchema`\>

#### Defined in

node_modules/@iota/is-shared-modules/lib/models/types/identity.d.ts:18


## Bugs
Since this package is in **beta** phase you might find some bugs while using the package. Please report them either 
1. In our [Discord](https://discord.com/channels/397872799483428865/910192737842790400) channel `integration-support`.
2. As a [GitHub issue](https://github.com/iotaledger/integration-services/issues)
3. Or via mail to `tim.sigl@iota.org` or `dominic.zettl@iota.org`

## Build the Package

Alternatively, you can build the package own your own.
First install the necessary dependencies using:

```bash
npm install
```

and then build with

```bash
npm run build
```

The build javascript package will be available in the `./dist` folder.

### Docs Compilation
The API reference of the docs is automatically compiled out of multiple sources. If you want to make changes to the README.md
edit the ./docs/README.md. The README.md in the root directory will be overwritten with the README.md in the docs folder.
