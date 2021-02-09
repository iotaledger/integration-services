import { ChannelInfo, ChannelInfoDto } from '../../models/data/channel-info';
import { getChannelInfoDto, getChannelInfoFromBody } from '.';

describe('test getChannelInfoFromBody', () => {
  it('should not return null for valid dto', () => {
    const validChannelInfoDto: ChannelInfoDto = {
      author: 'test-author',
      topics: [{ source: 'test', type: 'test-type' }],
      channelAddress: 'test-address'
    };
    const result = getChannelInfoFromBody(validChannelInfoDto);

    expect(result).not.toBeNull();
    expect(result.channelAddress).toEqual('test-address');
    expect(result.author).toEqual('test-author');
    expect(result.topics).toEqual([{ source: 'test', type: 'test-type' }]);
  });
  it('should return null for empty address', () => {
    const validChannelInfoDto: ChannelInfoDto = {
      author: 'test-author',
      topics: [{ source: 'test', type: 'test-type' }],
      channelAddress: ''
    };

    expect(getChannelInfoFromBody(validChannelInfoDto)).toBeNull();
  });
  it('should return null for author=null', () => {
    const validChannelInfoDto: ChannelInfoDto = {
      author: null,
      topics: [{ source: 'test', type: 'test-type' }],
      channelAddress: 'test-address'
    };

    expect(getChannelInfoFromBody(validChannelInfoDto)).toBeNull();
  });
  it('should return null for empty topics', () => {
    const validChannelInfoDto: ChannelInfoDto = {
      author: 'test-author',
      topics: [],
      channelAddress: 'test-address'
    };

    expect(getChannelInfoFromBody(validChannelInfoDto)).toBeNull();
  });
});

describe('test getChannelInfoDto', () => {
  it('should transform database object to transfer object', () => {
    const validChannelInfo: ChannelInfo = {
      created: new Date('Mon, 08 Feb 2021 16:22:53 GMT'),
      subscribers: [],
      latestMessage: new Date('Mon, 08 Feb 2021 16:22:53 GMT'),
      author: 'test-author',
      topics: [{ source: 'test', type: 'test-type' }],
      channelAddress: 'test-address'
    };
    const result = getChannelInfoDto(validChannelInfo);

    expect(result).not.toBeNull();
    expect(result.channelAddress).toEqual('test-address');
    expect(result.author).toEqual('test-author');
    expect(result.topics).toEqual([{ source: 'test', type: 'test-type' }]);
    expect(result.created).toEqual('08-02-2021');
    expect(result.latestMessage).toEqual('08-02-2021');
    expect(result.subscribers).toEqual([]);
  });
});
