import axios from 'axios';
import { CONFIG } from '../config/config';
import { writeChannel } from './channel.service';

/**
 * Forwards slaViolationCreateEvent and writes answer to the tangle
 * @param slaViolationCreateEvent the received and forwarded slaViolationCreateEvent
 */
export const forwardSlaViolation = async (slaViolationCreateEvent: any) => {
	console.log('Forwarding sla violation...');
	try {
		const response = await axios.post(`${CONFIG.mavenirApi}/tmf-api/slaManagement/v1/listener/slaViolationCreateEvent`, slaViolationCreateEvent);
		const eventSubscription = response?.data;
		if (response.status === 200) {
			console.log('Successfully forwarded sla violation!');
		}
		await writeChannel(eventSubscription, 'eventSubscription');
	} catch (error) {
		console.log(error);
	}
};
