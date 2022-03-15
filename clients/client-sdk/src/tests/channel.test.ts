import { ChannelClient, CreateChannelResponse } from '..';
import { adminUser, apiConfig, testChannel } from './test.data';

// 30 second timeout since tangle might be slow
jest.setTimeout(30000);

describe('test channel client', () => {
  let channelClient: ChannelClient;
  const ssiBridgeUrl = `${apiConfig.ssiBridgeUrl}/api/${apiConfig.apiVersion}`;
  const auditTrailUrl = `${apiConfig.auditTrailUrl}/api/${apiConfig.apiVersion}`;
  beforeEach(() => {
    channelClient = new ChannelClient(apiConfig);
  });
  describe('test authentication', () => {
    it('should authenticate user', async () => {
      jest.spyOn(channelClient, 'get');
      jest.spyOn(channelClient, 'getHexEncodedKey');
      jest.spyOn(channelClient, 'signNonce');
      jest.spyOn(channelClient, 'post');
      await channelClient.authenticate(adminUser.id, adminUser.secretKey);

      expect(channelClient.get).toHaveBeenCalledWith(
        `${ssiBridgeUrl}/authentication/prove-ownership/${adminUser.id}`
      );
      expect(channelClient.getHexEncodedKey).toHaveBeenCalledWith(adminUser.secretKey);
      expect(channelClient.jwtToken).toBeDefined();
      expect(channelClient.signNonce).toHaveBeenCalled();
      expect(channelClient.post).toHaveBeenCalledWith(
        `${ssiBridgeUrl}/authentication/prove-ownership/${adminUser.id}`,
        expect.objectContaining({ signedNonce: expect.any(String) })
      );
    });
    it('should not authenticate user since secret key is wrong', async () => {
      jest.spyOn(channelClient, 'get');
      jest.spyOn(channelClient, 'getHexEncodedKey');
      jest.spyOn(channelClient, 'signNonce');
      jest.spyOn(channelClient, 'post');
      try {
        await channelClient.authenticate(
          adminUser.id,
          'Hn5Sw3yuLVA8HSbf42sqYwa3A9Bd5YfxGRqLMA3L2w8L'
        );
      } catch (e: any) {
        expect(e.response.data).toMatchObject({ error: 'could not prove the ownership' });
      }

      expect(channelClient.get).toHaveBeenCalledWith(
        `${ssiBridgeUrl}/authentication/prove-ownership/${adminUser.id}`
      );
      expect(channelClient.getHexEncodedKey).toHaveBeenCalledWith(
        'Hn5Sw3yuLVA8HSbf42sqYwa3A9Bd5YfxGRqLMA3L2w8L'
      );
      expect(channelClient.jwtToken).toBeUndefined();
      expect(channelClient.signNonce).toHaveBeenCalled();
      expect(channelClient.post).toHaveBeenCalledWith(
        `${ssiBridgeUrl}/authentication/prove-ownership/${adminUser.id}`,
        expect.objectContaining({ signedNonce: expect.any(String) })
      );
    });
  });

  describe('test channel creation', () => {
    beforeEach(async () => {
      try {
        await channelClient.authenticate(adminUser.id, adminUser.secretKey);
      } catch (e: any) {
        console.log('error: ', e);
        expect(e).toBeUndefined();
      }
    });
    it('should create a new channel', async () => {
      jest.spyOn(channelClient, 'create');
      jest.spyOn(channelClient, 'post');
      try {
        const response = await channelClient.create(testChannel);
        expect(response).toMatchObject({
          seed: testChannel.seed,
          presharedKey: expect.any(String),
          channelAddress: expect.any(String)
        });
      } catch (e: any) {
        console.log('error: ', e);
        expect(e).toBeUndefined();
      }

      expect(channelClient.post).toHaveBeenCalledWith(
        `${auditTrailUrl}/channels/create`,
        testChannel
      );
    });
  });
});
