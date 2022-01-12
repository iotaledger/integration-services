# Delete Users

The [example-3](https://github.com/iotaledger/integration-services/blob/develop/clients/node/examples/3-DeleteUser.ts)
script authenticates a Integration Service client to manage Identities using the Admin identity created in [example-0](./how-to-run-examples) and then performs the following tasks:

* create a new identity
* remove it from Integration Services
* verify that the identity still exists on the Tangle

You can run the example with the following:

```bash
npm run example-3
```

## Remove used from Integration Services database

```js
// Remove the user and also revoke the user's credentials
await identity.remove(userIdentity.id, true);
```

Recall that removal of identity is just in the Integration Services backend:
the Identity cannot be removed from the Tangle

## Get identity directly from the Tangle

```js
const recoveredIdentity = await identity.latestDocument(userIdentity.id);
```