import { Identity, ApiVersion, ClientConfig, Channel } from 'integration-services-node';
import * as dotenv from 'dotenv';
dotenv.config();

let channel: Channel;
let identity: Identity;

async function setup() {
  try {
    // Configure api access
    const config: ClientConfig = {
      apiKey: process.env.API_KEY!,
      baseUrl: process.env.API_URL,
      apiVersion: ApiVersion.v1
    };

    // Create new Channel API
    channel = new Channel(config);
    // Create Identity API for authentication
    identity = new Identity(config);
  } catch (e) {
    console.error(e);
  }
}

async function createChannel() {
  // Create a new user. The user is used for authentication only.
  const user = await identity.create('User', { type: 'User' });
  // Authenticate as the user
  await channel.authenticate(user.doc.id, user.key.secret);

  // Create a new channel for example data
  const logChannel = await channel.create({
    topics: [{ type: 'example-data', source: 'data-creator' }]
  });

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
  channelData.forEach((data) => {
    console.log(data.log);
  });
}

async function main() {
  await setup();
  await createChannel();
}

main();
