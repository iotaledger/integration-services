import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';

export const getNonce = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const identityId = req.params.identityId;
		console.log(identityId);
		const apiKey = process.env.API_KEY ? `?api-key=${process.env.API_KEY}`: '';
		const response = await axios.get(`${process.env.BASE_URL}/authentication/prove-ownership/${identityId}${apiKey}`);
		return res.status(StatusCodes.OK).send(response.data);
	} catch (error) {
		console.log(error);
		next('could not authenticate');
	}
};

export const getJWT = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const identityId = req.params.identityId;
		const signedNonce = req.body;
		console.log(identityId, signedNonce);
		const apiKey = process.env.API_KEY ? `?api-key=${process.env.API_KEY}`: '';
		console.log(identityId, signedNonce);
		// const response = await axios.post(`${Config.baseUrl}/authentication/prove-ownership/${identity.doc.id}${apiKey}`, JSON.stringify({ signedNonce }), {
		const response = await axios.post(`${process.env.BASE_URL}/authentication/prove-ownership/${identityId}${apiKey}`, signedNonce);
		return res.status(StatusCodes.OK).send(response.data);
	} catch (error) {
		console.log(error);
		next('could not get jwt');
	}
};
