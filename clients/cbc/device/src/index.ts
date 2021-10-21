require('dotenv').config(); // eslint-disable-line
import { writeChannel } from './services/channel.service';
import { checkSubscriptionState } from './services/subscription.service';

import { setup } from './setup/setup';

const startDevice = async () => {
	console.log('Device demo started...');
	console.log('--------------------------------------------------------');
	console.log('--------------------------------------------------------');
	const { identityId, channelAddress } = await setup();
	await checkSubscriptionState(channelAddress, identityId);
	const measurement = (index: number) => {
		const factor = index * 0.5;
		return { produced: { value: factor * 30, unit: 'kWh' }, consumption: { value: factor * 20, unit: 'kWh' } };
	};

	await writeChannel({ ...measurement(1), identityId }, 'measurement');
	await writeChannel({ ...measurement(2), identityId }, 'measurement');
	await writeChannel({ ...measurement(3), identityId }, 'measurement');
	await writeChannel({ ...measurement(4), identityId }, 'measurement');
	console.log('Device demo finished :)');
};

startDevice();
