import { UserRoutes } from '.';
import * as UserDb from '../../database/user';
import { User, UserClassification, UserDto, UserSearch } from '../../models/data/user';
import { getDateFromString, getDateStringFromDate } from '../../utils/date';

describe('test Search user', () => {
  let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
  beforeEach(() => {
    sendMock = jest.fn();
    sendStatusMock = jest.fn();
    nextMock = jest.fn();

    res = {
      send: sendMock,
      sendStatus: sendStatusMock
    };
  });

  it('should call searchUser with expected user search', async () => {
    const expectedUserSearch: UserSearch = {
      classification: UserClassification.human,
      index: 1,
      limit: 1,
      username: 'charlie',
      verified: true,
      organization: 'IOTA',
      registrationDate: getDateFromString('2021-02-12T14:58:05+01:00'),
      subscribedChannelIds: ['test-address', 'test-address2']
    };
    const searchUserSpy = spyOn(UserDb, 'searchUsers').and.returnValue([]);
    const req: any = {
      params: {},
      query: {
        classification: 'human',
        'registration-date': '2021-02-12T14:58:05+01:00',
        verified: 'true',
        limit: '1',
        index: '1',
        username: 'charlie',
        organization: 'IOTA',
        'subscribed-channel-ids': ['test-address', 'test-address2']
      },
      body: null
    };
    const userRoutes = new UserRoutes();
    await userRoutes.searchUsers(req, res, nextMock);

    expect(searchUserSpy).toHaveBeenCalledWith(expectedUserSearch);
  });
});

describe('test GET user', () => {
  let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
  beforeEach(() => {
    sendMock = jest.fn();
    sendStatusMock = jest.fn();
    nextMock = jest.fn();

    res = {
      send: sendMock,
      sendStatus: sendStatusMock
    };
  });

  it('should return bad request if no user id is given as parameter', async () => {
    const req: any = {
      params: {},
      body: null
    };
    const userRoutes = new UserRoutes();

    await userRoutes.getUser(req, res, nextMock);
    expect(sendStatusMock).toHaveBeenCalledWith(400);
  });
  it('should return expected user', async () => {
    const date = getDateFromString('2021-02-12T14:58:05+01:00');
    const user: User = {
      userId: 'my-public-key-1',
      username: 'first-user',
      classification: UserClassification.human,
      subscribedChannelIds: [],
      firstName: 'Tom',
      lastName: 'Tomson',
      description: null,
      registrationDate: date,
      organization: 'IOTA'
    };
    const getUserSpy = spyOn(UserDb, 'getUser').and.returnValue(user);
    const req: any = {
      params: { userId: 'my-public-key-1' },
      body: null
    };
    const userRoutes = new UserRoutes();

    await userRoutes.getUser(req, res, nextMock);

    expect(getUserSpy).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith({
      userId: 'my-public-key-1',
      username: 'first-user',
      classification: 'human',
      subscribedChannelIds: [],
      firstName: 'Tom',
      lastName: 'Tomson',
      description: null,
      registrationDate: getDateStringFromDate(date),
      organization: 'IOTA'
    });
  });

  it('should call next(err) if an error occurs', async () => {
    const getUserSpy = spyOn(UserDb, 'getUser').and.callFake(() => {
      throw new Error('Test error');
    });
    const req: any = {
      params: { userId: 'my-public-key-1' },
      body: null
    };
    const userRoutes = new UserRoutes();

    await userRoutes.getUser(req, res, nextMock);

    expect(getUserSpy).toHaveBeenCalledTimes(1);
    expect(sendMock).not.toHaveBeenCalled();
    expect(nextMock).toHaveBeenCalledWith(new Error('Test error'));
  });
});
describe('test POST user', () => {
  let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
  const validBody: UserDto = {
    userId: 'my-public-key-1',
    username: 'first-user',
    classification: UserClassification.human,
    subscribedChannelIds: [],
    firstName: 'Tom',
    lastName: 'Tomson',
    description: null,
    registrationDate: '2021-02-12T14:58:05+01:00',
    organization: 'IOTA'
  };

  beforeEach(() => {
    sendMock = jest.fn();
    sendStatusMock = jest.fn();
    nextMock = jest.fn();

    res = {
      send: sendMock,
      sendStatus: sendStatusMock
    };
  });

  it('should return bad request if no valid body is given', async () => {
    const req: any = {
      params: {},
      body: null
    };
    const userRoutes = new UserRoutes();

    await userRoutes.addUser(req, res, nextMock);
    expect(nextMock).toHaveBeenCalled();
  });

  it('should return 404 since no user added', async () => {
    const addUserSpy = spyOn(UserDb, 'addUser').and.returnValue({ result: { n: 0 } });

    const req: any = {
      params: {},
      body: validBody
    };

    const resUpdate = {
      ...res,
      status: jest.fn(),
      send: jest.fn()
    };
    const userRoutes = new UserRoutes();

    await userRoutes.addUser(req, resUpdate, nextMock);

    expect(addUserSpy).toHaveBeenCalledTimes(1);
    expect(resUpdate.send).toHaveBeenCalledWith({ error: 'Could not add user!' });
    expect(resUpdate.status).toHaveBeenCalledWith(404);
  });
  it('should add user', async () => {
    const addUserSpy = spyOn(UserDb, 'addUser').and.returnValue({ result: { n: 1 } });

    const req: any = {
      params: {},
      body: validBody
    };

    const userRoutes = new UserRoutes();

    await userRoutes.addUser(req, res, nextMock);

    expect(addUserSpy).toHaveBeenCalledTimes(1);
    expect(sendStatusMock).toHaveBeenCalledWith(201);
  });

  it('should call next(err) if an error occurs', async () => {
    const addUserSpy = spyOn(UserDb, 'addUser').and.callFake(() => {
      throw new Error('Test error');
    });
    const req: any = {
      params: {},
      body: validBody
    };
    const userRoutes = new UserRoutes();

    await userRoutes.addUser(req, res, nextMock);

    expect(addUserSpy).toHaveBeenCalledTimes(1);
    expect(sendMock).not.toHaveBeenCalled();
    expect(nextMock).toHaveBeenCalledWith(new Error('Test error'));
  });
});
describe('test PUT user', () => {
  let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
  const validBody: UserDto = {
    userId: 'my-public-key-1',
    username: 'first-user',
    classification: UserClassification.human,
    subscribedChannelIds: [],
    firstName: 'Tom',
    lastName: 'Tomson',
    description: null,
    registrationDate: '2021-02-12T14:58:05+01:00',
    organization: 'IOTA'
  };

  beforeEach(() => {
    sendMock = jest.fn();
    sendStatusMock = jest.fn();
    nextMock = jest.fn();

    res = {
      send: sendMock,
      sendStatus: sendStatusMock
    };
  });

  it('should return bad request if no valid body is given', async () => {
    const req: any = {
      params: {},
      body: null
    };
    const userRoutes = new UserRoutes();

    await userRoutes.updateUser(req, res, nextMock);
    expect(nextMock).toHaveBeenCalled();
  });

  it('should return 404 since no user updated', async () => {
    const updateUserSpy = spyOn(UserDb, 'updateUser').and.returnValue({ result: { n: 0 } });

    const req: any = {
      params: {},
      body: validBody
    };

    const resUpdate = {
      ...res,
      status: jest.fn(),
      send: jest.fn()
    };

    const userRoutes = new UserRoutes();
    await userRoutes.updateUser(req, resUpdate, nextMock);

    expect(updateUserSpy).toHaveBeenCalledTimes(1);
    expect(resUpdate.send).toHaveBeenCalledWith({ error: 'No user found to update!' });
    expect(resUpdate.status).toHaveBeenCalledWith(404);
  });

  it('should return expected user', async () => {
    const updateUserSpy = spyOn(UserDb, 'updateUser').and.returnValue({ result: { n: 1 } });

    const req: any = {
      params: {},
      body: validBody
    };

    const userRoutes = new UserRoutes();
    await userRoutes.updateUser(req, res, nextMock);

    expect(updateUserSpy).toHaveBeenCalledTimes(1);
    expect(sendStatusMock).toHaveBeenCalledWith(200);
  });

  it('should call next(err) if an error occurs', async () => {
    const updateUserSpy = spyOn(UserDb, 'updateUser').and.callFake(() => {
      throw new Error('Test error');
    });
    const req: any = {
      params: {},
      body: validBody
    };
    const userRoutes = new UserRoutes();
    await userRoutes.updateUser(req, res, nextMock);

    expect(updateUserSpy).toHaveBeenCalledTimes(1);
    expect(sendMock).not.toHaveBeenCalled();
    expect(nextMock).toHaveBeenCalledWith(new Error('Test error'));
  });
});

describe('test DELETE user', () => {
  let sendMock: any, sendStatusMock: any, nextMock: any, res: any;

  beforeEach(() => {
    sendMock = jest.fn();
    sendStatusMock = jest.fn();
    nextMock = jest.fn();

    res = {
      send: sendMock,
      sendStatus: sendStatusMock
    };
  });

  it('should return bad request if no address is given as parameter', async () => {
    const req: any = {
      params: {},
      body: null
    };
    const userRoutes = new UserRoutes();
    await userRoutes.deleteUser(req, res, nextMock);
    expect(sendStatusMock).toHaveBeenCalledWith(400);
  });

  it('should return expected user', async () => {
    const deleteUserSpy = spyOn(UserDb, 'deleteUser');

    const req: any = {
      params: { userId: 'my-public-key-1' },
      body: null
    };

    const userRoutes = new UserRoutes();
    await userRoutes.deleteUser(req, res, nextMock);

    expect(deleteUserSpy).toHaveBeenCalledTimes(1);
    expect(sendStatusMock).toHaveBeenCalledWith(200);
  });

  it('should call next(err) if an error occurs', async () => {
    const deleteUserSpy = spyOn(UserDb, 'deleteUser').and.callFake(() => {
      throw new Error('Test error');
    });
    const req: any = {
      params: { userId: 'my-public-key-1' },
      body: null
    };
    const userRoutes = new UserRoutes();
    await userRoutes.deleteUser(req, res, nextMock);

    expect(deleteUserSpy).toHaveBeenCalledTimes(1);
    expect(sendMock).not.toHaveBeenCalled();
    expect(nextMock).toHaveBeenCalledWith(new Error('Test error'));
  });
});
