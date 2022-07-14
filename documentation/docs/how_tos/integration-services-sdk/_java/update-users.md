The [example-2](https://github.com/albydeca/iota-is-sdk/blob/main/examples/src/main/java/net/gradbase/examples/UpdateUser.java)
script authenticates an Integration Service client to manage Identities using the Admin identity created in [example-0](how-to-run-examples) and then performs the following tasks:

1. Searches for a user.
2. Updates said user's username. 

You can run the example with the following command:

```bash
cd /path/to/how_tos/folder/
mvn exec:_java -Dexec.mainClass=net.gradbase.how_tos.UpdateUser
```

## Search for a User{#search-for-a-user-java}

You can search for a user by the `username` field with the following script:

```java
// Search for identities with username 'User' in it
List<IdentityInternal> identities = client.search(null, "User", null, null, null);
```
