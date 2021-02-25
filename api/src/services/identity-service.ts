import * as Identity from '@iota/identity-wasm/node';
import { IdentityConfig } from '../models/config';
import { IdentityResponse } from '../models/data/identity';
const { KeyType, Document } = Identity;

export class IdentityService {
  private static instance: IdentityService;

  config: IdentityConfig;

  private constructor(config: any) {
    this.config = config;
  }

  public static getInstance(config: any): IdentityService {
    if (!IdentityService.instance) {
      IdentityService.instance = new IdentityService(config);
    }
    return IdentityService.instance;
  }

  createIdentity = async (): Promise<IdentityResponse> => {
    const user = this.generateUser();
    user.doc.sign(user.key);
    const txHash = await Identity.publish(user.doc.toJSON(), this.config);
    console.log(`Pub key: ${user.key.public} is verfied: ${user.doc.verify()}`);

    return {
      doc: user.doc,
      key: user.key,
      explorerUrl: `${this.config.explorer}/${txHash}`,
      txHash
    };
  };

  generateUser = () => {
    const { doc, key } = new Document(KeyType.Ed25519) as any;

    return {
      doc,
      key
    };
  };
}
