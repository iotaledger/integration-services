import { StatusCodes } from 'http-status-codes';
import { isAuth } from './authentication';

describe('test authentication middleware', () => {
  const serverSecret = 'very-secret-secret';
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

    isAuth(serverSecret)(req, res, nextMock);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith({ error: 'not authenticated!' });
  });

  it('request is not authenticated since no valid splittable authorization header provided!', async () => {
    const req: any = {
      headers: {
        authorization: 'Bearer'
      }
    };

    isAuth(serverSecret)(req, res, nextMock);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith({ error: 'not authenticated!' });
  });

  it('throws error since jwt signed with wrong key!', async () => {
    const req: any = {
      headers: {
        authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJJZCI6ImRpZDppb3RhOkNlZDNFTDRYTjdtTHk1QUNQZHJOc1I4SFppYjJNWEtVUXVBTVFZRU1iY2I0IiwicHVibGljS2V5IjoiOFdhR3NyMjc3SlFhcVY5ZnhIbUZOR0M5aGFBcEZiQmZkbnl0bXE1Z3E0dm0iLCJ1c2VybmFtZSI6InRlc3QtZGV2aWNlIiwiY2xhc3NpZmljYXRpb24iOiJkZXZpY2UiLCJzdWJzY3JpYmVkQ2hhbm5lbElkcyI6WyJ0ZXN0LWFkZHJlc3MtYzIiLCJ0ZXN0LWFkZHJlc3MiXSwiZmlyc3ROYW1lIjpudWxsLCJsYXN0TmFtZSI6bnVsbCwiZGVzY3JpcHRpb24iOiJEZXZpY2Ugd2hpY2ggbWVhc3VyZXMgdGVtcGVyYXR1cmUgaW4gdGhlIGtpdGNoZW4uIiwicmVnaXN0cmF0aW9uRGF0ZSI6IjIwMjEtMDMtMTZUMTU6MTg6NDkrMDE6MDAiLCJvcmdhbml6YXRpb24iOiJJT1RBIn0sImlhdCI6MTYxNTk3ODU4NCwiZXhwIjoxNjE2MTUxMzg0fQ.EoMSsUGhMsziao-6fnPLWilnST19rAPIZdtCrpWQWJc'
      }
    };
    const t = () => {
      isAuth(serverSecret)(req, res, nextMock);
    };

    expect(t).toThrowError();
  });

  it('throws error since jwt signed with wrong key!', async () => {
    const wrongUserJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiTkVFRFMgVE8gQkUgQ0FMTEVEIHVzZXJJZCJ9LCJpYXQiOjE2MTU5ODY3ODV9.lZr4gevzutbNQvkVfG0aV5GLzKRj8kp01QRgy4n8GCU';
    const req: any = {
      headers: {
        authorization: 'Bearer ' + wrongUserJwt
      }
    };
    // jwt from: { user: { id: 'NEEDS TO BE CALLED userId' }
    isAuth(serverSecret)(req, res, nextMock);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith({ error: 'not authenticated!' });
  });

  it('should add userId to request and call nextMock!', async () => {
    const validJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJJZCI6ImRpZDppb3RhOjEyMzQ1NiJ9LCJpYXQiOjE2MTU5ODY4ODR9.YH6kjYlMDG3MnhvB5q1AUR3ntiEj_m7dpSAMfNUJFx0';
    const req: any = {
      headers: {
        authorization: 'Bearer ' + validJwt
      }
    };
    // jwt from: { user: { userId: 'did:iota:123456' } }
    expect(req.userId).toBeUndefined();

    isAuth(serverSecret)(req, res, nextMock);

    expect(req.userId).toBe('did:iota:123456');
    expect(nextMock).toHaveBeenCalledWith();
  });
});
