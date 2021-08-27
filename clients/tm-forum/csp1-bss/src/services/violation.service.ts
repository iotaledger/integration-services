import axios from 'axios';
import { CONFIG } from '../config/config';
import { writeChannel } from './channel.service';

/**
 * Forwards slaViolationCreateEvent and writes answer to the tangle
 * @param slaViolationCreateEvent the received and forwarded slaViolationCreateEvent
 */
export const forwardSlaViolation = async (slaViolationCreateEvent: any) => {
	console.log('Forwarding sla violation rules...');
	try {
		await axios.post(`${CONFIG.mavenirApi}/tmf-api/slaManagement/v1/listener/slaViolationCreateEvent`, slaViolationCreateEvent);
		await writeChannel(slaViolationCreateEvent, 'createSlaViolationRules');
	} catch (error) {
		console.log(error);
	}
};
