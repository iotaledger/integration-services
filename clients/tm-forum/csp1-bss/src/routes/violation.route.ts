import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { writeViolations } from '../services/violation.service';

export class ViolationRoutes {
	writeViolation = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
		try {
			console.log('Writting violations...');
			const violations = req.body;
			await writeViolations(violations);
			return res.status(StatusCodes.OK).send();
		} catch (error) {
			console.log(error);
			next(new Error('could not write violation'));
		}
	};
}
