import { mongodbSanitizer } from './mongodb-sanitizer';

describe('test mongodb sanitizer middleware', () => {
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
	});

	it('should call nextMock since it is a valid body!', async () => {
		const req: any = {
			body: {
				x: 1
			}
		};

		mongodbSanitizer(req, res, nextMock);
		expect(nextMock).toHaveBeenCalled();
	});
	it('should return error since $ in highest field name', async () => {
		const req: any = {
			body: {
				$x: {
					y: 22,
					z: { d: 3 }
				}
			}
		};

		mongodbSanitizer(req, res, nextMock);
		expect(res.send).toHaveBeenCalledWith({ error: '$ is not allowed as key prefix.' });
	});
	it('should return error since $ in deepest field name', async () => {
		const req: any = {
			body: {
				x: {
					y: 22,
					z: { $d: 3 }
				}
			}
		};

		mongodbSanitizer(req, res, nextMock);
		expect(res.send).toHaveBeenCalledWith({ error: '$ is not allowed as key prefix.' });
	});
	it('should return error since $ in deepest array field name', async () => {
		const req: any = {
			body: {
				x: {
					y: 22,
					z: [{ $d: 3 }]
				}
			}
		};

		mongodbSanitizer(req, res, nextMock);
		expect(res.send).toHaveBeenCalledWith({ error: '$ is not allowed as key prefix.' });
	});
	it('should return error since $ in lowest field name of array body', async () => {
		const req: any = {
			body: [
				{
					x: [
						{
							y: 22,
							z: [[[{ $d: 3 }]]]
						}
					]
				}
			]
		};

		mongodbSanitizer(req, res, nextMock);
		expect(res.send).toHaveBeenCalledWith({ error: '$ is not allowed as key prefix.' });
	});
});
