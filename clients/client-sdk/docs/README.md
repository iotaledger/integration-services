# IOTA Integration Services Javascript Client
This is the javascript client for easy usability of the Integration Services API.
## Table of contents
- [IOTA Integration Services Javascript Client](#iota-integration-services-javascript-client)
  - [Table of contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Examples](#examples)
    - [Create a Admin Identity](#create-a-admin-identity)
    - [Create an Identity and a Credential](#create-an-identity-and-a-credential)
    - [Update Users](#update-users)
    - [Delete Users](#delete-users)
    - [Adding Trusted Authorities](#adding-trusted-authorities)
    - [Create a Channel](#create-a-channel)
    - [Authorize to Channel](#authorize-to-channel)
    - [Search Channels and Verify Data](#search-channels-and-verify-data)
  - [API Documentation](#api-documentation)
    - [Types](#types)
  - [Bugs](#bugs)
  - [Build the Package](#build-the-package)
    - [Docs Compilation](#docs-compilation)



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
import { IdentityClient, CredentialTypes, UserType, IdentityKeys } from '@iota/is-client';
import { defaultConfig } from './configuration';
import { readFileSync } from 'fs';

async function createIdentityAndCheckVCs() {
  const identity = new IdentityClient(defaultConfig);

  // Recover the admin identity
  const adminIdentity = JSON.parse(readFileSync('./adminIdentity.json').toString()) as IdentityKeys;

  // Authenticate as the admin identity
  await identity.authenticate(adminIdentity.id, adminIdentity.keys.sign.private);

  // Get admin identity data
  const adminIdentityPublic = await identity.find(adminIdentity.id);

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
    userIdentity?.id,
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
import { SearchCriteria, IdentityClient, IdentityKeys } from '@iota/is-client';
import { defaultConfig } from './configuration';
import { readFileSync } from 'fs';

async function searchIdentityAndUpdate() {
  const identity = new IdentityClient(defaultConfig);

  // Recover the admin identity
  const adminIdentity = JSON.parse(readFileSync('./adminIdentity.json').toString()) as IdentityKeys;

  // Authenticate as the admin identity
  await identity.authenticate(adminIdentity.id, adminIdentity.keys.sign.private);

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
import { SearchCriteria, IdentityClient, IdentityKeys } from '@iota/is-client';
import { defaultConfig } from './configuration';
import { readFileSync } from 'fs';

async function searchIdentityAndDelete() {
  const identity = new IdentityClient(defaultConfig);

  // Recover the admin identity
  const adminIdentity = JSON.parse(readFileSync('./adminIdentity.json').toString()) as IdentityKeys;

  // Authenticate as the root identity
  await identity.authenticate(adminIdentity.id, adminIdentity.keys.sign.private);

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
import { IdentityClient, CredentialTypes, UserType, IdentityKeys } from '@iota/is-client';
import { defaultConfig } from './configuration';
import { readFileSync } from 'fs';
import { externalDriverCredential1 } from './externalData';

async function trustedAuthorities() {
  const identity = new IdentityClient(defaultConfig);

  // Recover the admin identity
  const adminIdentity = JSON.parse(readFileSync('./adminIdentity.json').toString()) as IdentityKeys;

  // Authenticate as the admin identity
  await identity.authenticate(adminIdentity.id, adminIdentity.keys.sign.private);

  // Create an identity for a driver to issue him a driving license
  const username = 'Driver-' + Math.ceil(Math.random() * 100000);
  const driverIdentity = await identity.create(username);

  //Get root identity to issue an credential for the new driver
  const adminIdentityPublic = await identity.find(adminIdentity.id);
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
    driverIdentity?.id,
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
  await channel.authenticate(user.id, user.keys.sign.private);

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
  await ownerClient.authenticate(channelOwner.id, channelOwner.keys.sign.private);
  await userClient.authenticate(channelUser.id, channelUser.keys.sign.private);

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
      id: channelUser.id
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
  await ownerClient.authenticate(channelOwner.id, channelOwner.keys.sign.private);
  await userClient.authenticate(channelUser.id, channelUser.keys.sign.private);

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
    authorId: channelOwner.id,
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

#include "./temp-docs/enums/AccessRights.md"
#include "./temp-docs/enums/ApiVersion.md"
#include "./temp-docs/enums/CredentialTypes.md"
#include "./temp-docs/enums/UserType.md"

#include "./temp-docs/classes/ChannelClient.md"
#include "./temp-docs/classes/IdentityClient.md"

### Types
#include "./temp-docs/Types.md"

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
