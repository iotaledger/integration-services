import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';

export const mongodbSanitizer = (req: Request, res: Response, next: NextFunction) => {
	const body = req.body;

	const val = hasBadCharacter(body);

	if (val) {
		return res.status(StatusCodes.BAD_REQUEST).send({ error: '$ is not allowed as key' });
	}

	next();
};

export const hasBadCharacter = (data: any): boolean => {
	if (_.isObject(data)) {
		const keys = Object.keys(data);
		const foundBadChar = keys.map((k) => k.startsWith('$')).some((s) => s);
		if (foundBadChar) {
			return true;
		}
		const values = Object.values(data);
		return values.map((val) => hasBadCharacter(val)).some((v) => v);
	} else if (_.isArray(data)) {
		return data.map((obj) => hasBadCharacter(obj)).some((a) => a);
	}
	return false;
};
