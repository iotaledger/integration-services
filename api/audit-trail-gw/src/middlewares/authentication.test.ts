import { StatusCodes } from 'http-status-codes';
import { isAuth } from './authentication';

describe('test authentication middleware', () => {
	const jwtSecret = 'very-secret-secret';
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

	it('request is not authenticated since no authorization header provided!', async () => {
		const req: any = {
			headers: {
				authorization: ''
			}
		};

		isAuth(jwtSecret)(req, res, nextMock);

		expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
		expect(res.send).toHaveBeenCalledWith({ error: 'not authenticated!' });
	});

	it('request is not authenticated since no valid splittable authorization header provided!', async () => {
		const req: any = {
			headers: {
				authorization: 'Bearer'
			}
		};

		isAuth(jwtSecret)(req, res, nextMock);

		expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
		expect(res.send).toHaveBeenCalledWith({ error: 'not authenticated!' });
	});

	it('throws error since jwt signed with wrong key!', async () => {
		const req: any = {
			headers: {
				authorization:
					'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJJZCI6ImRpZDppb3RhOjZoeWFIZ3J2RWVYRDh6NnFxZDFReVlOUTFRRDU0ZlhmTHM2dUdldzNEZU51IiwicHVibGljS2V5IjoiRERCSmdFVU5tV2lzR2Y0Wmg2TWF6QXRlZjdWNUJqVkpkRVlLbzJ5UkxZVnAiLCJ1c2VybmFtZSI6InRlc3QtZGV2aWNlIiwiY2xhc3NpZmljYXRpb24iOiJkZXZpY2UiLCJzdWJzY3JpYmVkQ2hhbm5lbElkcyI6WyJ0ZXN0LWFkZHJlc3MtYzIiLCJ0ZXN0LWFkZHJlc3MiXSwiZmlyc3ROYW1lIjpudWxsLCJsYXN0TmFtZSI6bnVsbCwiZGVzY3JpcHRpb24iOiJEZXZpY2Ugd2hpY2ggbWVhc3VyZXMgdGVtcGVyYXR1cmUgaW4gdGhlIGtpdGNoZW4uIiwicmVnaXN0cmF0aW9uRGF0ZSI6IjIwMjEtMDMtMjRUMTY6NTQ6MzgrMDE6MDAiLCJ2ZXJpZmljYXRpb24iOnsidmVyaWZpZWQiOnRydWUsInZlcmlmaWNhdGlvbkRhdGUiOiIyMDIxLTAzLTI0VDE2OjU5OjAwKzAxOjAwIiwibGFzdFRpbWVDaGVja2VkIjoiMjAyMS0wMy0yNFQxNjo1OTowMCswMTowMCIsInZlcmlmaWNhdGlvbklzc3VlcklkIjoiZGlkOmlvdGE6NUVzZms5WUhwcVpBR0ZCQ2g0RXpiblZIMmtRaGlybXhRQXBjMWdoQ25jR1EifSwib3JnYW5pemF0aW9uIjoiSU9UQSIsIm9yZ2FuaXphdGlvblVybCI6bnVsbCwibG9jYXRpb24iOm51bGwsInZlcmlmaWFibGVDcmVkZW50aWFscyI6W3siQGNvbnRleHQiOiJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImlkIjoiZGlkOmlvdGE6Nmh5YUhncnZFZVhEOHo2cXFkMVF5WU5RMVFENTRmWGZMczZ1R2V3M0RlTnUiLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiVXNlckNyZWRlbnRpYWwiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6aW90YTo2aHlhSGdydkVlWEQ4ejZxcWQxUXlZTlExUUQ1NGZYZkxzNnVHZXczRGVOdSIsImNsYXNzaWZpY2F0aW9uIjoiZGV2aWNlIiwib3JnYW5pemF0aW9uIjoiSU9UQSIsInJlZ2lzdHJhdGlvbkRhdGUiOiIyMDIxLTAzLTI0VDE2OjU0OjM4KzAxOjAwIiwidXNlcm5hbWUiOiJ0ZXN0LWRldmljZSJ9LCJpc3N1ZXIiOiJkaWQ6aW90YTo1RXNmazlZSHBxWkFHRkJDaDRFemJuVkgya1FoaXJteFFBcGMxZ2hDbmNHUSIsImlzc3VhbmNlRGF0ZSI6IjIwMjEtMDMtMjRUMTU6NTg6NTlaIiwicHJvb2YiOnsidHlwZSI6Ik1lcmtsZUtleVNpZ25hdHVyZTIwMjEiLCJ2ZXJpZmljYXRpb25NZXRob2QiOiIja2V5LWNvbGxlY3Rpb24iLCJzaWduYXR1cmVWYWx1ZSI6IjlmTnFnWmZGWlRudDZIcHlSRDJ5WFJvdmlqamV3VlRwR1N6d05YNFl2UGIxLjExMTd1OWliUHp1OGl0ekhBV2pMZG82ajd2VFdkV0N1dkFEWTFvVXFySkx4VW1Ra0NuaEVnSldCb0FTd2VMWG9KQVBZdVVlOGl5eVlFZ29hUUREVEhoYUw1eFpROGZLNm5idzY3cUxvNUJ1VGJRSGlxcG5pbnRacGg5VGpLRmVwN3BrNnpvTE1HZEQuM3hoNHIzOGlpTGhYeWpCd2RKUE1xelN5ckpBdFNwM3UzcEpVR1RHeWR5TjQ1clRFV1hmcVBFREx3OHV4OXR0WGlqQURUSDVTQXdyOTI0QWduazJWbTN3QSJ9fV19LCJpYXQiOjE2MTY2MDUxMjgsImV4cCI6MTYxODMzMzEyOH0.ocjuG9oObwbURS0qO6FreSJUzRie_thYkEENE5d16ok'
			}
		};
		const t = () => {
			isAuth(jwtSecret)(req, res, nextMock);
		};

		expect(t).toThrowError();
	});

	it('throws error since jwt signed does not contain signed user object!', async () => {
		const wrongUserJwt =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkaWZmZXJlbnQtdXNlci1vYmplY3QiOnt9LCJpYXQiOjE2MTU5ODY3ODV9.VgXT7GIj5R4P1vjcoAFNZ5N-u8oRj90wRUyX5UgjV2Q';
		const req: any = {
			headers: {
				authorization: 'Bearer ' + wrongUserJwt
			}
		};
		// jwt from: { user: { id: 'NEEDS TO BE CALLED id' }
		isAuth(jwtSecret)(req, res, nextMock);

		expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
		expect(res.send).toHaveBeenCalledWith({ error: 'not authenticated!' });
	});

	// TODO fix test
	xit('should add user to request and call nextMock!', async () => {
		const validJwt =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJJZCI6ImRpZDppb3RhOjEyMzQ1NiJ9LCJpYXQiOjE2MTU5ODY4ODR9.YH6kjYlMDG3MnhvB5q1AUR3ntiEj_m7dpSAMfNUJFx0';
		const req: any = {
			headers: {
				authorization: 'Bearer ' + validJwt
			}
		};
		// jwt from: { user: { id: 'did:iota:123456' } }
		expect(req.user).toBeUndefined();

		isAuth(jwtSecret)(req, res, nextMock);

		expect(req.user).toEqual({ id: 'did:iota:123456' });
		expect(nextMock).toHaveBeenCalledWith();
	});
});
