import { createIdentity as createCreatorIdentity } from '../../log-creator/src/create-identity';
import { createStreamChannel } from '../../log-creator/src/create-stream-channel';
import { createIdentity as createAuditorIdentity } from '../../log-auditor/src/create-identity';
import { requestSubscription } from '../../log-auditor/src/request-subscription';
import { authorizeSubscription } from '../../log-creator/src/authorize-subscription';
import { writeStream } from '../../log-creator/src/write-stream-channel';
import { auditChannelData } from '../../log-auditor/src/audit-channel-data';
import * as dotenv from 'dotenv';

dotenv.config();
const run = async () => {
	await createCreatorIdentity();
	const channelAddress = (await createStreamChannel()) as string;
	await createAuditorIdentity();
	const subscriptionLink = (await requestSubscription(channelAddress)) as string;
	await authorizeSubscription(channelAddress, subscriptionLink);
	await writeStream(channelAddress);
	await auditChannelData(channelAddress);
};

run();
