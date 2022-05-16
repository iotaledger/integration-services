---
image: /img/integration-services/logo/integration_services.png
description: The example-2 script authenticates an Integration Service client to manage Identities using the Admin identity created in example-0 and then searches for a user and then updates said user's username.
keywords:
- how to
- search for users
- update user
- example
- manage identity
---


# Update Users

The [example-2](https://github.com/iotaledger/integration-services/blob/master/clients/client-sdk/examples/2-UpdateUser.ts)
script authenticates an Integration Service client to manage Identities using the Admin identity created in [example-0](./how-to-run-examples) and then performs the following tasks:

1. Searches for a user.
2. Updates said user's username. 

You can run the example with the following command:

```bash
npm run example-2
```

## Search for a User

You can search for a user by the `username` field with the following script:

```js
// Search for identities with username 'User' in it
const search: searchCriteria = { username: 'User' };

const identities = await identity.search(search);
```
