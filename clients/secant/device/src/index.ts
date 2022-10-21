require('dotenv').config(); // eslint-disable-line
import { writeChannel } from './services/channel.service';
import { checkSubscriptionState } from './services/subscription.service';

import { setup } from './setup/setup';
import { data2, data3 } from './config/dataset';

const startDevice = async () => {
	console.log('Device demo started...');
	console.log('--------------------------------------------------------');
	console.log('--------------------------------------------------------');
	const { id, channelAddress } = await setup();
	await checkSubscriptionState(channelAddress, id);

	await writeChannel({ ...data2 }, 'ambulanceUpdate');
	await writeChannel({ ...data3 }, 'ambulanceUpdate');
	console.log('Device demo finished :)');
};

startDevice();
