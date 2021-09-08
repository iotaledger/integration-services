import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CONFIG, ProductOrder, ServiceOrder, ServiceOrderCreate } from '../config/config';
import { hashNonce } from '../utils/encryption';
import { writeChannel } from '../services/channel.service';
export class ProductOrderRoutes {
	/**
	 * Receives productOrderCreate, statically maps to ServiceOrderCreate, forwards ServiceOrderCreate and writes answer (ServiceOrder) to the tangle
	 * @param req with productOrderCreate in body
	 * @param res return Created (201) with static ProductOrder
	 */
	forwardProductOrder = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		try {
			return new Promise(async (resolve) => {
				const productOrderCreate = req.body;
				console.log(`Received product order: ${JSON.stringify(productOrderCreate)}`);
				const hashedData = hashNonce(JSON.stringify(ProductOrder));
				const payload = { hashedData };
				await writeChannel(payload, 'productOrder');

				// here the csp1 would normally look in a product table to define the service order
				console.log('Forwarding service order...');
				await axios.post(`${CONFIG.mavenirApi}/api/rest/orderManagement/1.0.0/serviceOrder`, ServiceOrderCreate);
				const hashedServiceOrder = hashNonce(JSON.stringify(ServiceOrder));
				const serviceOrderPayload = { hashedData: hashedServiceOrder };
				await writeChannel(serviceOrderPayload, 'serviceOrder');

				resolve(res.status(StatusCodes.CREATED).send(ProductOrder));
			});
		} catch (error) {
			console.log(error);
			next(new Error('could not forward product order'));
		}
	};
}
