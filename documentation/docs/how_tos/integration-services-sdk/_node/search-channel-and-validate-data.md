The [example-7](https://github.com/iotaledger/integration-services/blob/master/clients/client-sdk/examples/5-SearchChannelAndValidateData.ts)
script is similar to previous example ([Authorize Channel](authorize-to-channel)) that creates a channel as `Owner` and authorizes a `User` to write on it but:

1. `Owner` sends some data on the channel.
2. `User` receives data and *modifies it*.
3. `User` validates the tampered data. However, the API will recognize that data are not valid by using the Tangle and data signatures (i.e. signatures not match). 

You can run the example with the following command:

```bash
npm run example-7
```

## Validate Channel's Data {#validate-channels-data--nodejs}

Since the signature do not match `results` is a set of tampered data, so the validation will notify it when running the following script:

```js
// Now try to validate the manipulated data
const validationResult2 = await userClient.validate(channelAddress, results);
```
