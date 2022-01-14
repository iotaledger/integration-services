import { hasBadCharacter } from './mongodb-sanitizer';

describe('test mongodb sanitizer middleware', () => {
	//let nextMock: any;
	let res: any, sendMock: any, sendStatusMock: any;
	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		//nextMock = jest.fn();
		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	it('should call nextmock!', async () => {
		const req: any = {
			body: {
				x: 1
			}
		};

		const x = hasBadCharacter(req.body);
		expect(x).toEqual(false);
	});
	it('should call nextmock2!', async () => {
		const req: any = {
			body: {
				x: {
					y: 22,
					z: { $d: 3 }
				}
			}
		};

		const x = hasBadCharacter(req.body);
		expect(x).toEqual(true);
	});
	it('should call nextmock3!', async () => {
		const req: any = {
			body: {
				x: {
					y: 22,
					z: [{ $d: 3 }]
				}
			}
		};

		const x = hasBadCharacter(req.body);
		expect(x).toEqual(true);
	});
	it('should call nextmock4!', async () => {
		const req: any = {
			body: [
				{
					x: [
						{
							y: 22,
							z: [{ $d: 3 }]
						}
					]
				}
			]
		};

		const x = hasBadCharacter(req.body);
		expect(x).toEqual(true);
	});
});
