import { requestSubscription } from '../services/channel.service';
import { createIdentity } from '../services/identity.serivce';

export const setup = async () => {
	await createIdentity();
	await requestSubscription();
};
