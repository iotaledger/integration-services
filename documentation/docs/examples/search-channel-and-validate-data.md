---
image: /img/logo/integration_services.png
description: The example-7 script creates 2 identities, and later uses them to demonstrate how you can detect if data has been tampered with by validating using the Tangle. 
keywords:
- channels
- authorize channel
- subscribe channel
- read channel
- validate channel data
---

# Search Channel and Validate Data

The [example-7](https://github.com/iotaledger/integration-services/blob/develop/clients/node/examples/5-SearchChannelAndValidateData.ts)
script is similar to previous example ([Authorize Channel](authorize-to-channel)) that creates a channel as `Owner` and authorizes a `User` to write on it but:

1. `Owner` send some data on the channel.
2. `User` receive data and *modifies it*.
3. `User` validates the tampered data. However, the API will recognize that data are not valid by using the Tangle and data signatures (i.e. signatures not match). 

You can run the example with the following command:

```bash
npm run example-7
```

## Validate Channel's Data 

Since the signature do not match `results` is a set of tampered data, so the validation will notify it when running the following script:

```js
// Now try to validate the manipulated data
const validationResult2 = await userClient.validate(channelAddress, results);
```
