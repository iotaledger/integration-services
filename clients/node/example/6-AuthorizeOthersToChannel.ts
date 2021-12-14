import { IdentityClient, ChannelClient } from 'integration-services-node';
import { AccessRights } from '../lib/models/schemas/subscription';

// In this example we will use two instances of the ChannelClient() both will authenticate a different user.
const channel1 = new ChannelClient();
const channel2 = new ChannelClient();
const identity = new IdentityClient();

async function authorizeOthersToChannel() {
  // Creating a channel owner who creates the channel and a channel user who will be authorized to read the channel
  console.log("Creating user...")
  const channelOwner = await identity.create('Owner');
  const channelUser = await identity.create('User');

  // We will use two instances of the channel api client. One is getting authorized by the owner and the other one by the user.
  await channel1.authenticate(channelOwner.doc.id, channelOwner.key.secret);
  await channel2.authenticate(channelUser.doc.id, channelUser.key.secret);
  console.log("User Id: ", channelUser.doc.id)
  // console.log("User secret key: ", channelUser.key.secret)

  // The owner creates a channel where he/she want to publish data of type 'example-data'.
  const { channelAddress } = await channel1.create({
    topics: [{ type: 'example-data', source: 'example-creator' }]
  });

  console.log("Writing to channel...")
  // Writing data to the channel as the channel owner.
  await channel1.write(channelAddress, {
    payload: { log: `This is log file 1` }
  });

  // This attempt to read the channel will fail because the channel user is no authorized to read the channel.
  try {
    const channelData = await channel2.read(channelAddress);
  } catch (error: any) {
    console.error('Error: ', error?.response?.data?.error);
  }

  // Request subscription to the channel as the user. The returned subscriptionLink can be used to authorize the user to the channel.
  const { subscriptionLink } = await channel2.requestSubscription(channelAddress, {
    accessRights: AccessRights.ReadAndWrite
  });

  // Find subscriptions to the channel that are not already authorized.
  const subscriptions = await channel1.findAllSubscriptions(channelAddress, false);
  console.log('Unauthorized subscriptions: ');
  subscriptions.forEach((subscription) => console.log(subscription.identityId));

  for (const subscription of subscriptions) {
    console.log(`Authorizing subscription: ${subscription.identityId}...`)
    // Authorize the user to the channel. Authorization can happen via the identityId of the user or the generated subscription link.
    const keyloadLink = await channel1.authorizeSubscription(channelAddress, {
      identityId: channelUser.doc.id
    });
  }

  // Writing data to channel as the channel owner. Make sure to authorize potential channel readers beforehand.
  console.log("Writing to channel...")
  await channel1.write(channelAddress, {
    payload: { log: `This is log file 2` }
  });

  // Reading the channel as the user
  const channelData = await channel2.read(channelAddress);
  console.log('First channel data log: ', channelData[0].log.payload);
}

authorizeOthersToChannel();
