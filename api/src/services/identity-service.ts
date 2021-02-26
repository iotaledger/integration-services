import * as Identity from '@iota/identity-wasm/node';
import { IdentityConfig } from '../models/config';
import { IdentityDocument, IdentityResponse } from '../models/data/identity';
const { Document } = Identity;

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
    const identity = this.generateIdentity();
    identity.doc.sign(identity.key);
    const txHash = await Identity.publish(identity.doc.toJSON(), this.config);
    console.log(`Pub key: ${identity.key.public} is verfied: ${identity.doc.verify()}`);

    return {
      doc: identity.doc,
      key: identity.key,
      explorerUrl: `${this.config.explorer}/${txHash}`,
      txHash
    };
  };

  generateIdentity = () => {
    const { doc, key } = new Document(this.config.keyType) as IdentityDocument;

    return {
      doc,
      key
    };
  };
}
