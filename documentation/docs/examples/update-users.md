# Update Users

The [example-2](https://github.com/iotaledger/integration-services/blob/develop/clients/node/examples/2-UpdateUser.ts)
script authenticates a Integration Service client to manage Identities using the Admin identity created in [example-0](./how-to-run-examples) and then performs the following tasks:

* search a user
* update its username 

You can run the example with the following:

```bash
npm run example-2
```

## Search a user

```js
// Search for identities with username 'User' in it
const search: searchCriteria = { username: 'User' };

const identities = await identity.search(search);
```
