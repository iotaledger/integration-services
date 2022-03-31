---
image: /img/integration-services/logo/integration_services.png
description: The example-3 script authenticates an Integration Service client to manage Identities using the Admin identity created in example-0 and then creates a new identity, removes it from Integration Services, and verifies that the identity still exists on the Tangle.
keywords:
- delete users
- retrieve identity from tangle
- verify identity
- example
- manage identity
- integration services backend
---


# Delete Users

The [example-3](https://github.com/iotaledger/integration-services/blob/master/clients/node/examples/3-DeleteUser.ts)
script authenticates an Integration Service client to manage Identities using the Admin identity created in [example-0](./how-to-run-examples) and then performs the following tasks:

1. Creates a new identity.
2. Removes it from Integration Services.
3. Verifies that the identity still exists on the Tangle.

You can run the example with the following command:

```bash
npm run example-3
```

## Remove User from Integration Services Database

You can remove an identity from the Integration Services backend by running the following script:

```js
// Remove the user and also revoke the user's credentials
await identity.remove(userIdentity.id, true);
```

:::note
You can only remove an identity in the Integration Services backend, **the Identity cannot be removed from the Tangle**.
:::

## Get an Identity Directly from the Tangle

You can retrieve an Identity from the Tangle by running the following script:

```js
const recoveredIdentity = await identity.latestDocument(userIdentity.id);
```