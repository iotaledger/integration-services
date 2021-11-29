import { Base } from './base';
import { ClientConfig } from '../models/clientConfig';

export class IdentityClient extends Base {
  constructor(config: ClientConfig) {
    super(config);
  }

  async identityCreate(username: string, claim: any) {
    return await this.post('identities/create', {
      username,
      claim,
    });
  }

  async identityFind(identityId: string) {
    return await this.get(
      `identities/identity/${identityId}`,
      {},
      this.jwtToken,
    );
  }

  async identitySearch(username: string) {
    return await this.get('identities/search', { username }, this.jwtToken);
  }

  async identityAdd(identity: any) {
    return this.post('identities/identity', identity, this.jwtToken);
  }

  async updateClaim(identity: any) {
    return this.put('identities/identity', identity, this.jwtToken);
  }

  async identityDelete(identityId: string, revokeCredentials: boolean = false) {
    return this.delete(
      `identities/identity/${identityId}`,
      { 'revoke-credentials': true },
      this.jwtToken,
    );
  }

  async credentialVerify(credential: any) {
    return await this.post(`verification/check-credential`, credential);
  }

  async createCredential(initiatorVC: any, targetDid: string, claim: any) {
    let body = {
      subject: {
        identityId: targetDid,
        credentialType: 'VerifiedIdentityCredential',
        claim: {
          type: 'Person',
          ...claim,
        },
      },
      initiatorVC: initiatorVC,
    };
    return await this.post(
      'verification/create-credential',
      body,
      this.jwtToken,
    );
  }

  async latestDocument(identityId: string) {
      return await this.get(`verification/latest-document/${identityId}`)
  }

  async addTrustedRoot(trustedRoot: any) {
      
  }
}
