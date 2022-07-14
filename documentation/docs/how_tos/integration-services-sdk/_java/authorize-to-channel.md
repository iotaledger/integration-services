The [example-6](https://github.com/albydeca/iota-is-sdk/blob/main/examples/src/main/java/net/gradbase/examples/AuthorizeToChannel.java)
script performs the following tasks:

1. Create two identities: `Owner` and `User`.
2. Authorize each identity against Integration Services API using different clients.
3. `Owner` creates a channel and writes data on it.
4. `User` tries to read from said channel, but fails because `User` does not have access.
5. `User` requests to [subscribe to the channel](#subscribe-to-channel-java).
6. `Owner` finds an unapproved subscription, and [authorizes it](#authorize-subscription-java).
7. `User` [sends data to the channel](#write-to-a-channel-java).
8. `Owner` is able to [read the second message sent by `User` from that channel](#read-from-a-channel-java).

You can run the example with the following command:

```bash
cd /path/to/how_tos/folder/
mvn exec:_java -Dexec.mainClass=net.gradbase.how_tos.AuthorizeToChannel
```

## Subscribe to a Channel{#subscribe-to-channel-java}

In the example the `userClient` tries to read from a channel while it did not have read/write permissions. This will raise an exception. The correct way is to first request subscription as shown in the following script:

```java
    JSONObject subRequest = userClient.requestSubscription(channelAddress,
				new JSONObject().put("accessRights", AccessRights.READ_AND_WRITE.toString()));
    String subscriptionLink = subRequest.getString("subscriptionLink");
    System.out.println("subscription link " + subscriptionLink);
```

## Authorize a Subscription{#authorize-subscription-java}

In order to allow `userClient` to read and write on that channel, its subscription needs to be authorized as shown in the following script:

```java
// Find subscriptions to the channel that are not already authorized.
    List<SubscriptionInternal> allSubs = ownerClient.findAllSubscriptions(channelAddress, false);

    for (SubscriptionInternal sub : allSubs) {
        if (!(sub.isAuthorized())) {
            System.out.println("authorising subscription " + sub.getId());
            JSONObject auth = ownerClient.authorizeSubscription(channelAddress,
                    new JSONObject().put("id", channelUser.getJSONObject("doc").getString("id")));
            System.out.println("KeyloadLink: " + auth.getString("keyloadLink"));
        }
    }
```

## Write to a Channel{#write-to-a-channel-java}

`userClient` can now write on a channel any JSON payload as using the following script:

```java
ownerClient.write(channelAddress, "log", null, new JSONObject().put("log", "This is log number 1"));
```

## Read from a Channel{#read-from-a-channel-java}

`userClient` can now read from the channel successfully using the following script:

```java
    List<ChannelData> data2 = userClient.read(channelAddress, null, null, null, null, null);
    for (ChannelData d : data2) {
        System.out.println(d.toString());
    }
```


