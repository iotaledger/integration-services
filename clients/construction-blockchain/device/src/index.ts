import * as dotenv from 'dotenv';
dotenv.config();
import { checkSubscriptionState } from './services/subscription.service';

import { setup } from './setup/setup';

const startDevice = async () => {
	console.log('--------------------------------------------------------');
	console.log('--------------------------------------------------------');
	const { identityId, channelAddress } = await setup();
	await checkSubscriptionState(channelAddress, identityId);

	console.log('after setup :)');
};

startDevice();
