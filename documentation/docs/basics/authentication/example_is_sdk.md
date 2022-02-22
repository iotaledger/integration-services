---
image: /img/integration-services/logo/integration_services.png
description: This section will show you an example on how to authenticate using the IOTA IS-SDK npm package.
keywords:
- authentication
- jwt
- nonce
- not-authenticated
- 401
- nodejs
- is-sdk
- npm
- how to
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Integration Services SDK

In this example you will learn how to authenticate your identity using our own **IOTA IS-SDK** npm package. This will be the easiest way to authenticate your identity since we are handling decoding, hashing and signing directly in the package itself. Make sure to read the [general authentication concept](https://wiki.iota.org/integration-services/authentication) for better understanding on how we authenticate users.

This example uses the following identity: 

```js
{
    identityId: 'did:iota:8BAmUqAg4aUjV3T9WUhPpDnFVbJSk16oLyFq3m3e62MF',
    secretKey: '5N3SxG4UzVDpNe4LyDoZyb6bSgE9tk3pE2XP5znXo5bF'
}
```

## Prerequisites 

* Recent version of [Node.js](https://nodejs.org/en/download/)

## Installation

<Tabs>
<TabItem value="npm" label="npm">

```bash
npm install iota-is-sdk
```

</TabItem>
<TabItem value="yarn" label="Yarn">

```bash
yarn add iota-is-sdk
```

</TabItem>
</Tabs>

## Authentication flow

:::info
The current API version (in this example `v0.1`) can be looked up using the [http://localhost:3000/info](http://localhost:3000/info) endpoint.
:::

:::danger
Never save your secret key in plain text in your code. Use local environment variables or IOTA [Stronghold](https://wiki.iota.org/stronghold.rs/welcome) to store your secret keys securely.
:::

Depending on the functionality you are going to use it might be sufficient to only authenticate the `IdentityClient()` or the `ChannelClient()`.
Each of the clients has it's own authentication state i.e. when you authenticate on the `IdentityClient()` you are not automatically authenticated on the `ChannelClient()`.

```js title="./authenticate.js
import { IdentityClient, ChannelClient, ApiVersion } from 'iota-is-sdk';

const authenticate = async (identityId, secretKey) => {
  const config = {
    baseUrl: 'http://localhost:3000',
    apiVersion: ApiVersion.v01
  };

  // Authenticate identity client
  const identity = new IdentityClient(config);
  await identity.authenticate(identityId, secretKey);

  // Authenticate channel client
  const channel = new ChannelClient(config);
  await channel.authenticate(identityId, secretKey);
};

const identityId = 'did:iota:8BAmUqAg4aUjV3T9WUhPpDnFVbJSk16oLyFq3m3e62MF';
const secretKey = '5N3SxG4UzVDpNe4LyDoZyb6bSgE9tk3pE2XP5znXo5bF';
authenticate(identityId, secretKey);
```

The code can also be found at this repository: [https://github.com/Schereo/is-sdk-authentication](https://github.com/Schereo/is-sdk-authentication).