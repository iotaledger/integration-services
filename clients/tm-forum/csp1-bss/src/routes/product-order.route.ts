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
	forwardProductOrder = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
		try {
			const productOrderCreate = req.body;
			console.log(`Product order: ${JSON.stringify(productOrderCreate)}`);
			await axios.post(`${CONFIG.mavenirApi}/tmf-api/serviceOrdering/v4/serviceOrder`, ServiceOrderCreate);
			const hashedData = hashNonce(JSON.stringify(ServiceOrder));
			const payload = { time: new Date(), hashedData };
			await writeChannel(payload, 'productOrder');
			return res.status(StatusCodes.CREATED).send(ProductOrder);
		} catch (error) {
			console.log(error);
			next(new Error('could not forward product order'));
		}
	};
}
