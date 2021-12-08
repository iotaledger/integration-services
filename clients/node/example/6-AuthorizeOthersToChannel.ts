import { IdentityClient, ChannelClient } from 'integration-services-node';

const channel1 = new ChannelClient();
const channel2 = new ChannelClient();
const identity = new IdentityClient();

async function authorizeOthersToChannel() {
  const channelOwner = await identity.create('Owner');
  const channelUser = await identity.create('User');

  await channel1.authenticate(channelOwner.doc.id, channelOwner.key.secret);
  await channel2.authenticate(channelUser.doc.id, channelUser.key.secret);

  const { channelAddress } = await channel1.create({
    topics: [{ type: 'example-data', source: 'example-creator' }]
  });

  await channel1.write(channelAddress, {
    payload: { log: `This is log file 1` }
  });

  // This attempt to read the channel will fail because the channel user is no authorized to read the channel
  try {
    const channelData = await channel2.read(channelAddress);
  } catch (error: any) {
    console.error('Error: ', error?.response?.data?.error);
  }

  const { subscriptionLink } = await channel2.requestSubscription(channelAddress);
  const subscriptions = await channel1.findAllSubscriptions(channelAddress, false);
  console.log('Unauthorized subscriptions: ', subscriptions);
  
  for (const subscription of subscriptions) {
    await channel1.authorizeSubscription(channelAddress, { identityId: subscription.identityId });
  }

  const channelData = await channel2.read(channelAddress);
  console.log('Channel data: ', channelData);
}

authorizeOthersToChannel();
