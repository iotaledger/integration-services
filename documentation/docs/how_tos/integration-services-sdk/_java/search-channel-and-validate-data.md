The [example-7](https://github.com/albydeca/iota-is-sdk/blob/main/examples/src/main/java/net/gradbase/examples/SearchChannelAndValidateData.java)
script is similar to previous example ([Authorize Channel](authorize-to-channel)) that creates a channel as `Owner` and authorizes a `User` to write on it but:

1. `Owner` sends some data on the channel.
2. `User` receives data and *modifies it*.
3. `User` validates the tampered data. However, the API will recognize that data are not valid by using the Tangle and data signatures (i.e. signatures not match). 

You can run the example with the following command:

```bash
cd /path/to/how_tos/folder/
mvn exec:_java -Dexec.mainClass=net.gradbase.how_tos.SearchChannelAndValidateData
```

## Validate Channel's Data {#validate-channels-data--java}

Since the signature does not match, `results` is a set of tampered data, so the validation will notify it when running the following script:

```java
// Now try to validate the manipulated data
JSONArray validated = userClient.validate(channelAddress, resuts);
```
