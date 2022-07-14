The [example-5](https://github.com/iotaledger/integration-services/blob/master/clients/client-sdk/examples/5-CreateChannel.ts)
script authenticates an Integration Service client to manage Identities using the Admin identity created in [example-0](./how-to-run-examples) and then performs the following tasks:

1. [Creates a channel](#create-channel-nodejs).
2. [Writes data on the channel](#write-on-a-channel-nodejs).
3. [Reads data from the channel](#read-from-a-channel-nodejs)

You can run the example with the following command:

```bash
npm run example-5
```

## Create Channel{#create-channel-nodejs}

You can create a channel using the following script:

```js
// The owner creates a channel where he/she want to publish data of type 'example-data'.
const { channelAddress } = await ownerClient.create({
    name: `Channel-${Math.ceil(Math.random() * 100000)}`,
    topics: [{ type: 'example-data', source: 'data-creator' }]
});
```

## Write on a Channel{#write-on-a-channel-nodejs}

You can write on a channel using the following script:

```js
await channel.write(channelAddress, {
    type: 'log',
    created: new Date().toISOString(),
    payload: {
        log: `This is log file ...`
    }
});
```

## Read from a Channel{#read-from-a-channel-nodejs}

You can read from a channel using the following script:

```js
const channelData = await channel.read(channelAddress);
console.log('Read from channel:');
channelData.forEach((data) => {
    console.log(data.log);
});
```
