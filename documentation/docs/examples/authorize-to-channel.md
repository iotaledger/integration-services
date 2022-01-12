# Authorize Channel

The [example-6](https://github.com/iotaledger/integration-services/blob/develop/clients/node/examples/6-AuthorizeToChannel.ts)
script performs the following tasks:

* create two identities: `Owner` and `User`
* you authorize each identity against Integration Services API (different clients)
* `Owner` create a channel and write data on it
* `User` try to read but fails (because it has no access)
* `User` request subscription
* `Owner` find unapproved subscription and approves it
* `User` send data to the channel
* `Owner` is able to read data (second message sent by `User`) from that channel

You can run the example with the following:

```bash
npm run example-6
```

## Subscribe to a channel

In the example the `userClient` try to read from a channel while it didn't have read/write permission: this will raise exception. The correct way is to first request subscription

```js
// Request subscription to the channel as the user. The returned subscriptionLink can be used to authorize the user to the channel.
const { subscriptionLink } = await userClient.requestSubscription(channelAddress, {
    accessRights: AccessRights.ReadAndWrite
});
```

## Authorize a subscription

In order to allow `userClient` to read/write on that channel, its subscription need to be authorized:

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

## Write to a channel

`userClient` can now write on a channel any JSON payload:

```js
// Writing data to the channel as the channel owner.
await ownerClient.write(channelAddress, {
    payload: { log: `This is log file 1` }
});
```

## Read from a channel

`userClient` can finally read messages successfully:

```js
const channelData = await userClient.read(channelAddress);
```


