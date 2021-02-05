import { ChannelInfoDto } from '../../models/data/channel-info';
import { getChannelInfoFromBody } from './routes';

describe('test getChannelInfoFromBody', () => {
  it('should not return null for valid object', () => {
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
  it('should return null if no topics are set', () => {
    const validChannelInfoDto: ChannelInfoDto = {
      author: 'test-author',
      topics: [],
      channelAddress: 'test-address'
    };

    expect(getChannelInfoFromBody(validChannelInfoDto)).toBeNull();
  });
});
