import * as dotenv from 'dotenv';
dotenv.config({ debug: true });

import { CONFIG, ProductOrderCreate } from './config/config';
import { setup } from './setup/setup';
import { leadCspClient } from './utils/client';

const app = async () => {
	await setup();
		const apiKey = CONFIG.apiKey ? `?api-key=${CONFIG.apiKey}` : '';
		console.log('Sending product order...');
		try {
			const response = await leadCspClient.post(
				`${CONFIG.csp1Url}/productOrderingManagement/v4/productOrder${apiKey}`,
				JSON.stringify(ProductOrderCreate)
			);
			if (response?.status === 201) {
				console.log('successfully send product order!');
				console.log(`Response product order: ${JSON.stringify(response?.data)}`);
			}
		} catch (error) {
			console.log(error);
		}
};

app();
