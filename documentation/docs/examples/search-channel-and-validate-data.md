# Search Channel and Validate Data

The [example-7](https://github.com/iotaledger/integration-services/blob/develop/clients/node/examples/5-SearchChannelAndValidateData.ts)
script is similar to previous example ([Authorize Channel](./authorize-to-channel)) that creates a channel as `Owner` and authorize a `User` to write on it but:

* `Owner` send some data on the channel
* `User` receive data and *modify them*
* `User` validate tampered data: the API (using Tangle and data signatures) will recognize that data are not valid (i.e. signatures not match) 

You can run the example with the following:

```bash
npm run example-7
```

## Validate Channel's Data 

`results` is a set of tampered data: validation will notify it since signature 
doesn't match:

```js
// Now try to validate the manipulated data
const validationResult2 = await userClient.validate(channelAddress, results);
```
