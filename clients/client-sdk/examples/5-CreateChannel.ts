import { IdentityClient, ChannelClient } from '@iota/is-client';

import { defaultConfig } from './configuration';

const channel = new ChannelClient(defaultConfig);
const identity = new IdentityClient(defaultConfig);

async function createChannel() {
  // Create a new user. The user is used for authentication only.
  const username = 'User-' + Math.ceil(Math.random() * 100000);
  const user = await identity.create(username);

  console.log('User', user);

  // Authenticate as the user
  await channel.authenticate(user.doc.id, user.key.secret);

  // Create a new channel for example data
  const logChannel = await channel.create({
    name: `Channel-${Math.ceil(Math.random() * 100000)}`,
    topics: [{ type: 'example-data', source: 'data-creator' }]
  });

  console.log('Log Channel', logChannel);

  // The channel address is used to read and write to channels
  const channelAddress = logChannel.channelAddress;
  console.log(`Channel address: ${channelAddress}`);

  // Writing 5 data packets to channel
  for (let i = 1; i <= 5; i++) {
    console.log(`Writing channel data ${i}`);
    await channel.write(channelAddress, {
      type: 'log',
      created: new Date().toISOString(),
      payload: {
        log: `This is log file #${i}`
      }
    });
  }

  // Reading channel
  const channelData = await channel.read(channelAddress);
  console.log('Read from channel:');
  channelData.forEach((data: any) => {
    console.log(data.log);
  });
}

createChannel();
