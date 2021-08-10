import axios from 'axios';
import { CONFIG } from '../config/config';
import { writeChannel } from './channel.service';

export const writeViolations = async (violations: any[]) => {
	try {
		console.log('Received violation!')
		const response = await axios.post(CONFIG.mavenirApi, violations);
		const payload = response.data;
		await writeChannel(payload, 'violationResponse');
	} catch (error) {
		console.log(error);
	}
};
