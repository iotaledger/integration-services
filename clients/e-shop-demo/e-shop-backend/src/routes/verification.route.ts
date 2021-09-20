import axios from 'axios';
import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const verifyCredential = async (req: any, res: Response, next: NextFunction): Promise<any> => {
	try {
		const credential = req.body;
		console.log(credential);
		const apiKey = process.env.API_KEY ? `?api-key=${process.env.API_KEY}`: '';
		const response = await axios.post(`${process.env.BASE_URL}/verification/check-credential${apiKey}`, credential);
        console.log(response?.data)
		return res.status(StatusCodes.OK).send(response?.data);
	} catch (error) {
		console.log(error);
		next('could not authenticate');
	}
};
