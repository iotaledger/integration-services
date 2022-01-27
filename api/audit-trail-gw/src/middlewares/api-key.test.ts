import { StatusCodes } from 'http-status-codes';
import { hasValidApiKey } from './api-key';

describe('test api-key middleware', () => {
	let nextMock: any, res: any, sendMock: any, sendStatusMock: any;
	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
		nextMock = jest.fn();
	});

	it('request has not the valid api key!', async () => {
		const req: any = {
			query: {
				'api-key': 'wrong-api-key'
			}
		};

		hasValidApiKey('valid-api-key')(req, res, nextMock);

		expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
		expect(res.send).toHaveBeenCalledWith({ error: 'no valid api key provided!' });
		expect(nextMock).not.toHaveBeenCalledWith();
	});

	it('no api key was set by the server so everything is valid', async () => {
		const req: any = {
			query: {
				'api-key': 'any-value-is-ok'
			}
		};

		hasValidApiKey('')(req, res, nextMock);
		expect(nextMock).toHaveBeenCalledWith();
	});

	it('request has no valid query', async () => {
		const req: any = {
			query: undefined
		};

		hasValidApiKey('valid-api-key')(req, res, nextMock);

		expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
		expect(res.send).toHaveBeenCalledWith({ error: 'no valid api key provided!' });
		expect(nextMock).not.toHaveBeenCalledWith();
	});

	it('request has a valid api key!', async () => {
		const req: any = {
			query: {
				'api-key': 'valid-api-key'
			}
		};

		hasValidApiKey('valid-api-key')(req, res, nextMock);
		expect(nextMock).toHaveBeenCalledWith();
	});
});
