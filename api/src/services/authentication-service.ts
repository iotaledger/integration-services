import * as Identity from '@iota/identity-wasm/node';
import { IdentityConfig } from '../models/config';
const { KeyType, Document } = Identity;

export interface IdentityDocument extends Identity.Document {
  doc: any;
  key: any;
}

export interface IdentityResponse {
  doc: any;
  key: any;
  txHash: string;
  explorerUrl: string;
  message: string;
}

export class AuthenticationService {
  private static instance: AuthenticationService;

  config: IdentityConfig;

  private constructor(config: any) {
    this.config = config;
  }

  public static getInstance(config: any): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService(config);
    }
    return AuthenticationService.instance;
  }

  createIdentity = async (): Promise<IdentityResponse> => {
    // TODO add user info
    const user = this.generateUser(); //

    user.doc.sign(user.key);

    const txHash = await Identity.publish(user.doc.toJSON(), this.config);

    console.log('Verified (user): ', user.doc.verify());

    return {
      doc: user.doc,
      key: user.key,
      explorerUrl: `${this.config.explorer}/${txHash}`,
      txHash,
      message: ''
    };
  };

  generateUser = () => {
    const { doc, key } = new Document(KeyType.Ed25519) as IdentityDocument;

    return {
      doc,
      key,
      message: ''
    };
  };
}
