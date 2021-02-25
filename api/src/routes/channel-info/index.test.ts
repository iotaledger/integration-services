import { ChannelInfoPersistence, ChannelInfo, ChannelInfoSearch } from '../../models/data/channel-info';
import { ChannelInfoRoutes } from '.';
import * as ChannelInfoDb from '../../database/channel-info';
import { UserService } from '../../services/user-service';
import { getDateFromString, getDateStringFromDate } from '../../utils/date';
import { ChannelInfoService } from '../../services/channel-info-service';

describe('test Search user', () => {
  let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
  let channelInfoRoutes: ChannelInfoRoutes, userService: UserService, channelInfoService: ChannelInfoService;
  beforeEach(() => {
    sendMock = jest.fn();
    sendStatusMock = jest.fn();
    nextMock = jest.fn();
    userService = new UserService();
    channelInfoService = new ChannelInfoService(userService);
    channelInfoRoutes = new ChannelInfoRoutes(channelInfoService);

    res = {
      send: sendMock,
      sendStatus: sendStatusMock
    };
  });

  it('should call searchChannelInfo with expected search', async () => {
    const expectedChannelInfoSearch: ChannelInfoSearch = {
      author: 'charliebrown',
      authorId: '1234-5678-9',
      topicType: 'test-topic',
      topicSource: 'test-source',
      limit: 1,
      index: 1,
      created: getDateFromString('2021-02-12T14:58:05+01:00'),
      latestMessage: getDateFromString('2021-02-12T14:58:05+01:00')
    };
    const searchChannelInfoSpy = spyOn(ChannelInfoDb, 'searchChannelInfo').and.returnValue([]);
    const getUserSpy = spyOn(userService, 'getUser').and.returnValue({ userId: '1234-5678-9' });

    const req: any = {
      params: {},
      query: {
        author: 'charliebrown',
        'topic-type': 'test-topic',
        'topic-source': 'test-source',
        limit: '1',
        index: '1',
        created: '2021-02-12T14:58:05+01:00',
        'latest-message': '2021-02-12T14:58:05+01:00'
      },
      body: null
    };

    await channelInfoRoutes.searchChannelInfo(req, res, nextMock);

    expect(getUserSpy).toHaveBeenCalledWith('charliebrown');
    expect(searchChannelInfoSpy).toHaveBeenCalledWith(expectedChannelInfoSearch);
  });
});

describe('test GET channelInfo', () => {
  let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
  let channelInfoRoutes: ChannelInfoRoutes, userService: UserService, channelInfoService: ChannelInfoService;

  beforeEach(() => {
    sendMock = jest.fn();
    sendStatusMock = jest.fn();
    nextMock = jest.fn();
    userService = new UserService();
    channelInfoService = new ChannelInfoService(userService);
    channelInfoRoutes = new ChannelInfoRoutes(channelInfoService);
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

    await channelInfoRoutes.getChannelInfo(req, res, nextMock);
    expect(sendStatusMock).toHaveBeenCalledWith(400);
  });

  it('should return expected channel info', async () => {
    const date = getDateFromString('2021-02-09T00:00:00+01:00');
    const channelInfo: ChannelInfoPersistence = {
      created: date,
      authorId: 'test-author2',
      subscriberIds: [],
      topics: [
        {
          source: 'test',
          type: 'test-type'
        }
      ],
      latestMessage: null,
      channelAddress: 'test-address3'
    };
    const getChannelInfoSpy = spyOn(ChannelInfoDb, 'getChannelInfo').and.returnValue(channelInfo);
    const req: any = {
      params: { channelAddress: 'test-address' },
      body: null
    };

    await channelInfoRoutes.getChannelInfo(req, res, nextMock);

    expect(getChannelInfoSpy).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith({
      authorId: 'test-author2',
      channelAddress: 'test-address3',
      created: getDateStringFromDate(date),
      latestMessage: null,
      subscriberIds: [],
      topics: [{ source: 'test', type: 'test-type' }]
    });
  });

  it('should call next(err) if an error occurs', async () => {
    const getChannelInfoSpy = spyOn(ChannelInfoDb, 'getChannelInfo').and.callFake(() => {
      throw new Error('Test error');
    });
    const req: any = {
      params: { channelAddress: 'test-address' },
      body: null
    };

    await channelInfoRoutes.getChannelInfo(req, res, nextMock);

    expect(getChannelInfoSpy).toHaveBeenCalledTimes(1);
    expect(sendMock).not.toHaveBeenCalled();
    expect(nextMock).toHaveBeenCalledWith(new Error('Test error'));
  });
});

describe('test POST channelInfo', () => {
  let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
  let channelInfoRoutes: ChannelInfoRoutes, userService: UserService, channelInfoService: ChannelInfoService;

  const validBody: ChannelInfo = {
    authorId: 'test-author2',
    channelAddress: 'test-address3',
    created: '02-09-2021',
    latestMessage: null,
    subscriberIds: [],
    topics: [{ source: 'test', type: 'test-type' }]
  };

  beforeEach(() => {
    sendMock = jest.fn();
    sendStatusMock = jest.fn();
    nextMock = jest.fn();
    userService = new UserService();
    channelInfoService = new ChannelInfoService(userService);
    channelInfoRoutes = new ChannelInfoRoutes(channelInfoService);

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
    await channelInfoRoutes.addChannelInfo(req, res, nextMock);
    expect(nextMock).toHaveBeenCalled();
  });

  it('should return 404 since no channel added', async () => {
    const addChannelInfoSpy = spyOn(ChannelInfoDb, 'addChannelInfo').and.returnValue({ result: { n: 0 } });

    const req: any = {
      params: {},
      body: validBody
    };

    const resUpdate = {
      ...res,
      status: jest.fn(),
      send: jest.fn()
    };

    await channelInfoRoutes.addChannelInfo(req, resUpdate, nextMock);

    expect(addChannelInfoSpy).toHaveBeenCalledTimes(1);
    expect(resUpdate.send).toHaveBeenCalledWith({ error: 'Could not add channel info' });
    expect(resUpdate.status).toHaveBeenCalledWith(404);
  });

  it('should add channel info', async () => {
    const addChannelInfoSpy = spyOn(ChannelInfoDb, 'addChannelInfo').and.returnValue({ result: { n: 1 } });

    const req: any = {
      params: {},
      body: validBody
    };

    await channelInfoRoutes.addChannelInfo(req, res, nextMock);

    expect(addChannelInfoSpy).toHaveBeenCalledTimes(1);
    expect(sendStatusMock).toHaveBeenCalledWith(201);
  });

  it('should call next(err) if an error occurs', async () => {
    const addChannelInfoSpy = spyOn(ChannelInfoDb, 'addChannelInfo').and.callFake(() => {
      throw new Error('Test error');
    });
    const req: any = {
      params: {},
      body: validBody
    };
    await channelInfoRoutes.addChannelInfo(req, res, nextMock);

    expect(addChannelInfoSpy).toHaveBeenCalledTimes(1);
    expect(sendMock).not.toHaveBeenCalled();
    expect(nextMock).toHaveBeenCalledWith(new Error('Test error'));
  });
});

describe('test PUT channelInfo', () => {
  let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
  let channelInfoRoutes: ChannelInfoRoutes, userService: UserService, channelInfoService: ChannelInfoService;

  const validBody: ChannelInfo = {
    authorId: 'test-author2',
    channelAddress: 'test-address3',
    created: '02-09-2021',
    latestMessage: null,
    subscriberIds: [],
    topics: [{ source: 'test', type: 'test-type' }]
  };

  beforeEach(() => {
    sendMock = jest.fn();
    sendStatusMock = jest.fn();
    nextMock = jest.fn();
    userService = new UserService();
    channelInfoService = new ChannelInfoService(userService);
    channelInfoRoutes = new ChannelInfoRoutes(channelInfoService);

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
    await channelInfoRoutes.updateChannelInfo(req, res, nextMock);
    expect(nextMock).toHaveBeenCalled();
  });

  it('should return 404 since no channel updated', async () => {
    const updateChannelInfoSpy = spyOn(ChannelInfoDb, 'updateChannelInfo').and.returnValue({ result: { n: 0 } });

    const req: any = {
      params: {},
      body: validBody
    };

    const resUpdate = {
      ...res,
      status: jest.fn(),
      send: jest.fn()
    };

    await channelInfoRoutes.updateChannelInfo(req, resUpdate, nextMock);

    expect(updateChannelInfoSpy).toHaveBeenCalledTimes(1);
    expect(resUpdate.send).toHaveBeenCalledWith({ error: 'No channel info found to update!' });
    expect(resUpdate.status).toHaveBeenCalledWith(404);
  });

  it('should return expected channel info', async () => {
    const updateChannelInfoSpy = spyOn(ChannelInfoDb, 'updateChannelInfo').and.returnValue({ result: { n: 1 } });

    const req: any = {
      params: {},
      body: validBody
    };

    await channelInfoRoutes.updateChannelInfo(req, res, nextMock);

    expect(updateChannelInfoSpy).toHaveBeenCalledTimes(1);
    expect(sendStatusMock).toHaveBeenCalledWith(200);
  });

  it('should call next(err) if an error occurs', async () => {
    const updateChannelInfoSpy = spyOn(ChannelInfoDb, 'updateChannelInfo').and.callFake(() => {
      throw new Error('Test error');
    });
    const req: any = {
      params: {},
      body: validBody
    };
    await channelInfoRoutes.updateChannelInfo(req, res, nextMock);

    expect(updateChannelInfoSpy).toHaveBeenCalledTimes(1);
    expect(sendMock).not.toHaveBeenCalled();
    expect(nextMock).toHaveBeenCalledWith(new Error('Test error'));
  });
});

describe('test DELETE channelInfo', () => {
  let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
  let channelInfoRoutes: ChannelInfoRoutes, userService: UserService, channelInfoService: ChannelInfoService;

  beforeEach(() => {
    sendMock = jest.fn();
    sendStatusMock = jest.fn();
    nextMock = jest.fn();
    userService = new UserService();
    channelInfoService = new ChannelInfoService(userService);
    channelInfoRoutes = new ChannelInfoRoutes(channelInfoService);

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
    await channelInfoRoutes.deleteChannelInfo(req, res, nextMock);
    expect(sendStatusMock).toHaveBeenCalledWith(400);
  });

  it('should return expected channel info', async () => {
    const deleteChannelInfoSpy = spyOn(ChannelInfoDb, 'deleteChannelInfo');

    const req: any = {
      params: { channelAddress: 'test-address' },
      body: null
    };

    await channelInfoRoutes.deleteChannelInfo(req, res, nextMock);

    expect(deleteChannelInfoSpy).toHaveBeenCalledTimes(1);
    expect(sendStatusMock).toHaveBeenCalledWith(200);
  });

  it('should call next(err) if an error occurs', async () => {
    const deleteChannelInfoSpy = spyOn(ChannelInfoDb, 'deleteChannelInfo').and.callFake(() => {
      throw new Error('Test error');
    });
    const req: any = {
      params: { channelAddress: 'test-address' },
      body: null
    };
    await channelInfoRoutes.deleteChannelInfo(req, res, nextMock);

    expect(deleteChannelInfoSpy).toHaveBeenCalledTimes(1);
    expect(sendMock).not.toHaveBeenCalled();
    expect(nextMock).toHaveBeenCalledWith(new Error('Test error'));
  });
});
