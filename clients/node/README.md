# IOTA Integration Services Node.js Client

This is the node.js client for easy usability of the Integration Services API.
## Prerequisites 

* A recent version of Node.js
* Running a local instance of the [Integration Services API](https://github.com/iotaledger/integration-services)

## Installation

* `npm install @iota/is-client`

## Examples

Create an Identity with Verifiable Credentials: 
```javascript
import {
  IdentityClient,
  Manager,
  IdentityJson,
  CredentialTypes,
  UserType
} from 'integration-services-node';
import * as dotenv from 'dotenv';
dotenv.config();

const identity = new IdentityClient();
let rootIdentityWithKeys: IdentityJson;

async function setup() {
  // Create db connection
  const manager = new Manager(
    process.env.MONGO_URL!,
    process.env.DB_NAME!,
    process.env.SECRET_KEY!
  );
  // Get root identity directly from db
  rootIdentityWithKeys = await manager.getRootIdentity();
  await manager.close();
}

async function createIdentityAndCheckVCs() {
  // Authenticate as the root identity
  await identity.authenticate(rootIdentityWithKeys.doc.id, rootIdentityWithKeys.key.secret);

  //Get root identity
  const rootIdentity = await identity.find(rootIdentityWithKeys?.doc?.id);

  // Get root identy's VC
  // @ts-ignore: Object is possibly 'null'.
  const identityCredential = rootIdentity!.verifiableCredentials[0];

  // Create identity for user
  const userIdentity = await identity.create('User');

  console.log('~~~~~~~~~~~~~~~~');
  console.log('Created user identity: ', userIdentity);
  console.log('~~~~~~~~~~~~~~~~');
  // Assign a verifiable credential to the user as rootIdentity
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

async function main() {
  await setup();
  await createIdentityAndCheckVCs();
}

main();
```

Create a Channel and write data:

```javascript
import { IdentityClient, ChannelClient } from 'integration-services-node';

const channel = new ChannelClient();
const identity = new IdentityClient();

async function createChannel() {
  // Create a new user. The user is used for authentication only.
  const user = await identity.create('User');
  // Authenticate as the user
  await channel.authenticate(user.doc.id, user.key.secret);

  // Create a new channel for example data
  const logChannel = await channel.create({
    topics: [{ type: 'example-data', source: 'data-creator' }]
  });

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

More examples can be found in the [Integration Service GitHub](https://github.com/iotaledger/integration-services/tree/master/clients/node/example).
