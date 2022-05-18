import { IdentityClient, ChannelClient } from '@iota/is-client';

import { defaultConfig } from './configuration';

// In this example we will use two instances of the ChannelClient() both will authenticate a different user.
const ownerClient = new ChannelClient(defaultConfig);
const userClient = new ChannelClient(defaultConfig);
const identity = new IdentityClient(defaultConfig);

async function searchChannelAndValidateData() {
  // Creating a channel owner who creates the channel and a channel user who will be authorized to read the channel
  console.log('Creating user...');
  const ownerUsername = 'Owner-' + Math.ceil(Math.random() * 100000);
  const subscriberUsername = 'Subscriber-' + Math.ceil(Math.random() * 100000);
  const channelOwner = await identity.create(ownerUsername);
  const channelUser = await identity.create(subscriberUsername);

  // We will use two instances of the channel api client. One is getting authorized by the owner and the other one by the user.
  await ownerClient.authenticate(channelOwner.doc.id, channelOwner.key.secret);
  await userClient.authenticate(channelUser.doc.id, channelUser.key.secret);

  // The owner creates a channel where he/she want to publish data of type 'example-data'.
  const { channelAddress } = await ownerClient.create({
    name: `Channel-${Math.ceil(Math.random() * 100000)}`,
    topics: [{ type: 'example-data', source: 'example-creator' }]
  });

  // Search for channels that where created since midnight with topic type 'example-data' and with specified authorId.
  // Just passing in new Date() to 'created' will never yield results since it selects only channels that where create
  // later or equal to the specified date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const channels = await userClient.search({
    authorId: channelOwner.doc.id,
    topicType: 'example-data',
    created: today
  });

  if (channels.length == 0) {
    console.error('Could not find any channels matching the search criteria.');
    return;
  }

  // Request subscription to the first channel
  const { subscriptionLink } = await userClient.requestSubscription(channels[0].channelAddress);

  // Authorize subscription by subscription link
  await ownerClient.authorizeSubscription(channelAddress, { subscriptionLink });

  // Writing data to the channel as the channel owner.
  await ownerClient.write(channelAddress, {
    payload: { log: `This is log file 1` }
  });

  // Read data from channel as the user
  const results = await userClient.read(channelAddress);

  console.log('Read data: ', JSON.stringify(results, null, 4));

  // Validate data read from the channel. This validation will pass since the data is freshly read from the tangle an was not manipulated
  const validationResult = await userClient.validate(channelAddress, results);

  console.log('Validation result: ', validationResult);

  // Manipulate the data
  const tamperedResult = { log: 'This log is not the original' };
  results[0].log.payload = tamperedResult;

  // Now try to validate the manipulated data
  const validationResult2 = await userClient.validate(channelAddress, results);

  // If the validation fails like in this case the original data is included in the validation result
  console.log(
    'Validation result with manipulated data: ',
    JSON.stringify(validationResult2, null, 4)
  );
}

searchChannelAndValidateData();
