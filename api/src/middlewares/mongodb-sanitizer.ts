import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';

const BAD_CHAR = '$';

export const mongodbSanitizer = (req: Request, res: Response, next: NextFunction) => {
	const body = req.body;

	const val = hasBadCharacter(body, BAD_CHAR);

	if (val) {
		return res.status(StatusCodes.BAD_REQUEST).send({ error: `${BAD_CHAR} is not allowed as key prefix.` });
	}

	next();
};

const hasBadCharacter = (data: any, character: string): boolean => {
	if (_.isObject(data)) {
		const keys = Object.keys(data);
		const numberOfBadChars = keys?.filter((k) => k.startsWith(character))?.length;

		if (numberOfBadChars != 0) {
			return true;
		}

		const values = Object.values(data);
		return recursiveCall(values, character);
	} else if (_.isArray(data)) {
		return recursiveCall(data, character);
	}

	return false;
};

const recursiveCall = (values: any, char: string): boolean => values.map((val: any) => hasBadCharacter(val, char)).some((v: boolean) => v);
