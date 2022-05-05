---
image: /img/integration-services/logo/integration_services.png
description: The example-5 script authenticates an Integration Service client to manage Identities using the Admin identity created in example-0 and then creates a channel, writes data on the channel, reads data from the channel.
keywords:
- how to
- create channel
- read channel
- write channel
- example
---
# Create Channel

The [example-5](https://github.com/albydeca/iota-is-sdk/blob/main/examples/src/main/java/net/gradbase/examples/CreateChannel.java)
script authenticates an Integration Service client to manage Identities using the Admin identity created in [example-0](how-to-run-examples) and then performs the following tasks:

1. Creates a channel.
2. Writes data on the channel.
3. Reads data from the channel

You can run the example with the following command:

```bash
cd /path/to/examples/folder/
mvn exec:java -Dexec.mainClass=net.gradbase.examples.CreateChannel
```

## Create Channel

You can create a channel using the following script:

```js
    Map<String, String> topics = new HashMap<String, String>();
    topics.put("type", "example-data");
    topics.put("source", "data-creator");

    List<Map<String, String>> allTopics = new ArrayList<Map<String, String>>();
    allTopics.add(topics);

    // Create a new channel for example data
    JSONObject newChannelDetails = channelClient.create(null, allTopics, null, null, null);

    // The channel address is used to read and write to channels
    String channelAddress = newChannelDetails.getString("channelAddress");
    System.out.println(channelAddress);
```

## Write on a Channel

You can write on a channel using the following script:

```java
    // Writing 5 data packets to channel
    for (int i = 0; i < 3; i++) {
        System.out.println("writing data to channel no " + i);
        channelClient.write(channelAddress, "log", null, new JSONObject().put("log", "This is log number " + i));
    }
```

## Read from a Channel

You can read from a channel using the following script:

```java
    List<ChannelData> datas = channelClient.read(channelAddress, null, null, null, null, null);

    for (ChannelData data : datas) {
        System.out.println(data.toString());
    }
```
