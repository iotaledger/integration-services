import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CONFIG } from '../config/config';
import { hashNonce } from '../utils/encryption';
import { writeChannel } from '../services/channel.service';
export class ProductOrderRoutes {
	forwardProductOrder = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
		try {
			const productOrder = req.body;
			await axios.post(CONFIG.mavenirApi, productOrder);
			const hashedData = hashNonce(JSON.stringify(productOrder));
			const payload = { time: new Date(), hashedData };
			await writeChannel(payload, 'productOrder');
			return res.status(StatusCodes.OK).send();
		} catch (error) {
			console.log(error);
			next(new Error('could not forward product order'));
		}
	};
}
