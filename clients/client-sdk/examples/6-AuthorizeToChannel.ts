import { AccessRights, IdentityClient, ChannelClient } from '@iota/is-client-sdk';

import { defaultConfig } from './configuration';

// In this example we will use two instances of the ChannelClient() both will authenticate a different user.
const ownerClient = new ChannelClient(defaultConfig);
const userClient = new ChannelClient(defaultConfig);
const identity = new IdentityClient(defaultConfig);

async function authorizeOthersToChannel() {
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

  console.log('Writing to channel...');
  // Writing data to the channel as the channel owner.
  await ownerClient.write(channelAddress, {
    payload: { log: `This is log file 1` }
  });

  // This attempt to read the channel will fail because the channel user is no authorized to read the channel.
  try {
    const channelData = await userClient.read(channelAddress);
  } catch (error: any) {
    console.error('Error: ', error?.response?.data?.error);
  }

  // Request subscription to the channel as the user. The returned subscriptionLink can be used to authorize the user to the channel.
  const { subscriptionLink } = await userClient.requestSubscription(channelAddress, {
    accessRights: AccessRights.ReadAndWrite
  });

  console.log('Subscription Link:', subscriptionLink);

  // Find subscriptions to the channel that are not already authorized.
  const subscriptions = await ownerClient.findAllSubscriptions(channelAddress, false);

  console.log('Subscriptions Found:', subscriptions);

  const unauthorizedSubscriptions = subscriptions.filter(
    (subscription) => !subscription.isAuthorized
  );

  console.log('Unauthorized subscriptions:', unauthorizedSubscriptions);

  for (const subscription of unauthorizedSubscriptions) {
    console.log(`Authorizing subscription: ${subscription.id}...`);
    // Authorize the user to the channel. Authorization can happen via the id of the user or the generated subscription link.
    const keyloadLink = await ownerClient.authorizeSubscription(channelAddress, {
      id: channelUser.doc.id
    });
    console.log('Subscription Keyload Link:', keyloadLink);
  }

  // Writing data to channel as the channel owner. Make sure to authorize potential channel readers beforehand.
  console.log('Writing to channel...');
  await ownerClient.write(channelAddress, {
    payload: { log: `This is log file 2` }
  });

  // Reading the channel as the user
  console.log('reading as subscriber...');
  const channelData = await userClient.read(channelAddress);
  console.log('First channel data log: ', channelData?.[0]?.log?.payload);
}

authorizeOthersToChannel();
