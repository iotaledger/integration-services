---
image: /img/integration-services/logo/integration_services.png
description: This section will show you an example on how to authenticate using Node.js.
keywords:
- authentication
- jwt
- nonce
- not-authenticated
- 401
- nodejs
- javascript
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Node.js

In this example, you will learn to authenticate your identity using Node.js. Make sure to read the [general authentication concept](https://wiki.iota.org/integration-services/authentication) so you can fully understand the [Authentication Workflow](https://wiki.iota.org/integration-services/authentication#authentication-workflow).

This example uses the following identity: 

```js
{
    identityId: 'did:iota:8BAmUqAg4aUjV3T9WUhPpDnFVbJSk16oLyFq3m3e62MF',
    secretKey: '5N3SxG4UzVDpNe4LyDoZyb6bSgE9tk3pE2XP5znXo5bF'
}
```

## Prerequisites 

* A recent version of [Node.js](https://nodejs.org/en/download/) (>14.19.0).

### Required Packages 


This example uses `Axios` as the HTTP client, `bs58` to decode Base58, and [@noble/ed25519](https://www.npmjs.com/package/noble-ed25519) to sign the nonce. However, you can use any package as long as it accomplishes the same result.

Newer versions may work, but the examples were tested with the following versions:

<Tabs>
<TabItem value="npm" label="npm">

```bash
npm install @noble/ed25519@1.5.1
```

```bash
npm install bs58@4.0.1
```

```bash
npm install axios@0.21.4
```

</TabItem>
<TabItem value="yarn" label="Yarn">

```bash
yarn add @noble/ed25519@1.5.1
```

```bash
yarn add bs58@4.0.1
```

```bash
yarn add axios@0.21.4
```

</TabItem>
</Tabs>

## Authentication Workflow

### 1. Request a Nonce

First, request a nonce and supply your identity id.

:::info
You can find your current API version using the [http://localhost:3000/info](http://localhost:3000/info) endpoint. This example uses `v0.1`.
:::
```js title="./authenticate.js"
import axios from 'axios';

const requestNonce = async () => {
  const identityId = 'did:iota:8BAmUqAg4aUjV3T9WUhPpDnFVbJSk16oLyFq3m3e62MF';
  const url = `http://localhost:3000/api/v0.1/authentication/prove-ownership/${identityId}`
  const request = await axios.get(url);
  console.log(request.data);
};

requestNonce();
```

The returned response body  will look like this .js object.
```js
{ nonce: '3eaf8814caa842d94fdb96fc26d02f7c339e65ff' }
```

### 2. Hash the Nonce

After you have retrieved the nonce, you should hash it. You can use the Node API's [createHash()](https://nodejs.org/api/crypto.html#hashupdatedata-inputencoding) function to hash the nonce with the SHA-256 hash function and convert it to hexadecimal.
```js title="./authenticate.js"
import crypto from 'crypto';

const hashNonce = () => {
  const nonce = '3eaf8814caa842d94fdb96fc26d02f7c339e65ff';

  const hashedNonce = crypto.createHash('sha256').update(nonce).digest('hex');
  console.log(hashedNonce);
};

hashNonce();
```
The nonce used generated the following hash:
```
6d748f209e5af1f5b8825f7822d6659c45c874076cd2b3337c7861fd94cd3ba5
```

### 3. Sign the hashed nonce
Your secret key is encoded in Base58 and has to be decoded first. Afterwards the nonce is signed with your encoded secret key and saved as a hexadecimal string.
:::danger
Never save your secret key in plain text in your code. Use local environment variables or IOTA [Stronghold](https://wiki.iota.org/stronghold.rs/welcome) to store your secret keys securely.
:::

```js title="./authenticate.js"
import * as ed from '@noble/ed25519';
import bs58 from 'bs58';

const signNonce = async () => {
  const hashedNonce = '6d748f209e5af1f5b8825f7822d6659c45c874076cd2b3337c7861fd94cd3ba5';
  const secretKey = '5N3SxG4UzVDpNe4LyDoZyb6bSgE9tk3pE2XP5znXo5bF';
  
  const encodedSecretKey = bs58.decode(secretKey).toString('hex');
  const signedNonceArray = await ed.sign(hashedNonce, encodedSecretKey);
  const signedNonce = ed.Signature.fromHex(signedNonceArray).toHex();
  console.log(signedNonce);
};

signNonce();
```

The nonce and secret key used generated the following signed nonce:
```
270c2e502c5c753e39159683981e452444f81a10d798f56406a9c471d672a5ede1792cb7f97d4f9c9efeec7bf35577dd1f8482afca7e3710291868a65bf91e07
```

### 4. Request the JWT
The last step is to request the JWT. Use the following code snippet with your signed nonce in the request body.
```js title="./authenticate.js"
import axios from 'axios';

const requestJWT = async () => {
  const identityId = 'did:iota:8BAmUqAg4aUjV3T9WUhPpDnFVbJSk16oLyFq3m3e62MF';
  const body = {
    signedNonce:
      '270c2e502c5c753e39159683981e452444f81a10d798f56406a9c471d672a5ede1792cb7f97d4f9c9efeec7bf35577dd1f8482afca7e3710291868a65bf91e07'
  };
  const url = `http://localhost:3000/api/v0.1/authentication/prove-ownership/${identityId}`;

  const request = await axios.post(url, body);
  console.log(request.data);
};

requestJWT();
```

The returned js object will contain the JWT:
```js
{
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZGlkOmlvdGE6OEJBbVVxQWc0YVVqVjNUOVdVaFBwRG5GVmJKU2sxNm9MeUZxM20zZTYyTUYiLCJwdWJsaWNLZXkiOiI3WFRYVlJ5M0cxTVhjbURrejJiUUNiV3B2OEF6b1FSZ3hHdjVtRG0xRkoxdCIsInVzZXJuYW1lIjoiVGltMTIzNDUiLCJyZWdpc3RyYXRpb25EYXRlIjoiMjAyMi0wMi0xOFQwNzo0ODo0NSswMTowMCIsImNsYWltIjp7InR5cGUiOiJQZXJzb24ifSwicm9sZSI6IlVzZXIifSwiaWF0IjoxNjQ1MTc3OTg1LCJleHAiOjE2NDUyNjQzODV9.-O2UpPyfWOvtLV2cUF9fPVhgCGDCVwFU9zXrpn_uKU0'
}
```

### 5. Set JWT as Axios header
When using Axios the JWT can easily be set as a default header that will be used in every subsequent request. This step may differ depending on your preferred HTTP client library.
```js title="./authenticate.js"
import axios from 'axios';

const setAxiosHeader = () => {
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZGlkOmlvdGE6OEJBbVVxQWc0YVVqVjNUOVdVaFBwRG5GVmJKU2sxNm9MeUZxM20zZTYyTUYiLCJwdWJsaWNLZXkiOiI3WFRYVlJ5M0cxTVhjbURrejJiUUNiV3B2OEF6b1FSZ3hHdjVtRG0xRkoxdCIsInVzZXJuYW1lIjoiVGltMTIzNDUiLCJyZWdpc3RyYXRpb25EYXRlIjoiMjAyMi0wMi0xOFQwNzo0ODo0NSswMTowMCIsImNsYWltIjp7InR5cGUiOiJQZXJzb24ifSwicm9sZSI6IlVzZXIifSwiaWF0IjoxNjQ1MTc3OTg1LCJleHAiOjE2NDUyNjQzODV9.-O2UpPyfWOvtLV2cUF9fPVhgCGDCVwFU9zXrpn_uKU0';

  axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
};

setAxiosHeader();
```
##  Putting it all together
This is the final code using all functions together to request a JWT.
The code can also be found at this repository: [https://github.com/Schereo/is-node-authentication](https://github.com/Schereo/is-node-authentication).

```js title="./authenticate.js"
import axios from 'axios';
import * as ed from '@noble/ed25519';
import bs58 from 'bs58';
import crypto from 'crypto';

const requestNonce = async (identityId) => {
  const url = `http://localhost:3000/api/v0.1/authentication/prove-ownership/${identityId}`;
  const request = await axios.get(url);
  return request.data.nonce;
};

const hashNonce = (nonce) => {
  const hashedNonce = crypto.createHash('sha256').update(nonce).digest('hex');
  return hashedNonce;
};

const signNonce = async (hashedNonce, secretKey) => {
  const encodedSecretKey = bs58.decode(secretKey).toString('hex');
  const signedNonceArray = await ed.sign(hashedNonce, encodedSecretKey);
  const signedNonce = ed.Signature.fromHex(signedNonceArray).toHex();
  return signedNonce;
};

const requestJwt = async (identityId, signedNonce) => {
  const url = `http://localhost:3000/api/v0.1/authentication/prove-ownership/${identityId}`;
  const request = await axios.post(url, { signedNonce });
  return request.data.jwt;
};

const setAxiosHeader = (jwt) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
};

const authenticate = async (identityId, secretKey) => {
  const nonce = await requestNonce(identityId);
  const hashedNonce = hashNonce(nonce);
  const signedNonce = await signNonce(hashedNonce, secretKey);
  const jwt = await requestJwt(identityId, signedNonce);
  setAxiosHeader(jwt);
};

const identityId = 'did:iota:8BAmUqAg4aUjV3T9WUhPpDnFVbJSk16oLyFq3m3e62MF';
const secretKey = '5N3SxG4UzVDpNe4LyDoZyb6bSgE9tk3pE2XP5znXo5bF';
authenticate(identityId, secretKey);

```

