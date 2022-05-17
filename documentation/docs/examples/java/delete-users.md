---
image: /img/integration-services/logo/integration_services.png
description: The example-3 script authenticates an Integration Service client to manage Identities using the Admin identity created in example-0 and then creates a new identity, removes it from Integration Services, and verifies that the identity still exists on the Tangle.
keywords:
- how to
- delete users
- retrieve identity from tangle
- verify identity
- example
- manage identity
- integration services backend
---


# Delete Users

The [example-3](https://github.com/albydeca/iota-is-sdk/blob/main/examples/src/main/java/net/gradbase/examples/DeleteUser.java)
script authenticates an Integration Service client to manage Identities using the Admin identity created in [example-0](how-to-run-examples) and then performs the following tasks:

1. Creates a new identity.
2. Removes it from Integration Services.
3. Verifies that the identity still exists on the Tangle.

You can run the example with the following command:

```bash
cd /path/to/examples/folder/
mvn exec:java -Dexec.mainClass=net.gradbase.examples.DeleteUser
```

## Remove User from Integration Services Database

You can remove an identity from the Integration Services backend by running the following script:

```java
// Remove the user and also revoke the user's credentials
identityClient.remove(someIdentity.getId(), true);
```

:::note
You cannot delete an identity from the Tangle. You can only remove it from the Integration Services database.
:::

## Get an Identity Directly from the Tangle

You can retrieve an Identity from the Tangle by running the following script:

```java
JSONObject recoveredIdentity = identityClient.latestDocument(someIdentity.getId());
```