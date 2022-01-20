import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';

export const getNonce = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const id = req.params.id;
		const apiKey = process.env.API_KEY ? `?api-key=${process.env.API_KEY}` : '';
		const response = await axios.get(`${process.env.BASE_URL}/authentication/prove-ownership/${id}${apiKey}`);
		return res.status(StatusCodes.OK).send(response.data);
	} catch (error) {
		console.log(error);
		next('could not authenticate');
	}
};

export const getJWT = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const id = req.params.id;
		const signedNonce = req.body;
		const apiKey = process.env.API_KEY ? `?api-key=${process.env.API_KEY}` : '';
		const response = await axios.post(`${process.env.BASE_URL}/authentication/prove-ownership/${id}${apiKey}`, signedNonce);
		return res.status(StatusCodes.OK).send(response.data);
	} catch (error) {
		console.log(error);
		next('could not get jwt');
	}
};
