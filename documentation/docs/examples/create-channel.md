# Create Channel

The [example-5](https://github.com/iotaledger/integration-services/blob/develop/clients/node/examples/5-CreateChannel.ts)
script authenticates a Integration Service client to manage Identities using the Admin identity created in [example-0](./how-to-run-examples) and then performs the following tasks:

* create a channel
* write data on the channel
* read data from the channel

You can run the example with the following:

```bash
npm run example-5
```

## Create Channel

```js
// The owner creates a channel where he/she want to publish data of type 'example-data'.
const { channelAddress } = await ownerClient.create({
    topics: [{ type: 'example-data', source: 'data-creator' }]
});
```

## Write on a Channel

```js
await channel.write(channelAddress, {
    type: 'log',
    created: new Date().toISOString(),
    payload: {
        log: `This is log file ...`
    }
});
```

## Read from a Channel

```js
const channelData = await channel.read(channelAddress);
console.log('Read from channel:');
channelData.forEach((data) => {
    console.log(data.log);
});
```
