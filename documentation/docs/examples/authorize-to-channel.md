---
image: /img/integration-services/logo/integration_services.png
description: The example-6 script creates 2 identities, and later uses them to demonstrate how to authorize channel subscriptions, subscribe to a channel and read from channels.
keywords:
- channels
- authorize channel
- subscribe channel 
- read channel
---

# Authorize Channel

The [example-6](https://github.com/iotaledger/integration-services/blob/develop/clients/node/examples/6-AuthorizeToChannel.ts)
script performs the following tasks:

1. Create two identities: `Owner` and `User`.
2. Authorize each identity against Integration Services API using different clients.
3. `Owner` creates a channel and writes data on it.
4. `User` tries to read from said channel, but fails because `User` does not have access.
5. `User` requests to subscribe to the channel.
6. `Owner` finds an unapproved subscription, and approves it.
7. `User` sends data to the channel.
8. `Owner` is able to read the second message sent by `User` from that channel.

You can run the example with the following command:

```bash
npm run example-6
```

## Subscribe to a Channel

In the example the `userClient` tries to read from a channel while it did not have read/write permissions. This will raise an exception. The correct way is to first request subscription as shown in the following script:

```js
// Request subscription to the channel as the user. The returned subscriptionLink can be used to authorize the user to the channel.
const { subscriptionLink } = await userClient.requestSubscription(channelAddress, {
    accessRights: AccessRights.ReadAndWrite
});
```

## Authorize a Subscription

In order to allow `userClient` to read and write on that channel, its subscription need to be authorized as shown in the following script:

```js
// Find subscriptions to the channel that are not already authorized.
const subscriptions = await ownerClient.findAllSubscriptions(channelAddress, false);

const unauthorizedSubscriptions = subscriptions.filter(subscription => !subscription.isAuthorized)

for (const subscription of unauthorizedSubscriptions) {
    // Authorize the user to the channel. 
    // Authorization can happen via the id of the user or the generated subscription link.
    const keyloadLink = await ownerClient.authorizeSubscription(channelAddress, {
        id: channelUser.doc.id
    });
    console.log("Subscription Keyload Link:", keyloadLink)
}
```

## Write to a Channel

`userClient` can now write on a channel any JSON payload as using the following script:

```js
// Writing data to the channel as the channel owner.
await ownerClient.write(channelAddress, {
    payload: { log: `This is log file 1` }
});
```

## Read from a Channel

`userClient` can now read from the channel successfully using the following script:

```js
const channelData = await userClient.read(channelAddress);
```


