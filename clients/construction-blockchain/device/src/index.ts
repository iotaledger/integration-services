require('dotenv').config();
import { writeChannel } from './services/channel.service';
import { checkSubscriptionState } from './services/subscription.service';

import { setup } from './setup/setup';

const startDevice = async () => {
	console.log('--------------------------------------------------------');
	console.log('--------------------------------------------------------');
	const { identityId, channelAddress } = await setup();
	await checkSubscriptionState(channelAddress, identityId);
	await writeChannel({ test: 2 }, 'testpayload1');
	await writeChannel({ test: 2 }, 'testpayload2');
	await writeChannel({ test: 2 }, 'testpayload3');
	await writeChannel({ test: 2 }, 'testpayload4');
	console.log('after setup :)');
};

startDevice();
