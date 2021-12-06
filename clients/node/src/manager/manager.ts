import { MongoClient } from 'mongodb';
import { IdentityInternal, IdentityJson } from '../models/types';
const crypto = require('crypto');

export class Manager {
  private client: MongoClient;

  constructor(
    private mongoURL: string,
    private databaseName: string,
    private secretKey: string,
  ) {
    this.client = new MongoClient(mongoURL);
  }

  async getRootIdentity(): Promise<IdentityJson> {
    await this.client.connect();
    const database = this.client.db(this.databaseName);
    const identities = database.collection('identity-docs');
    let identity = await identities.findOne<IdentityJson>({});
    await database
      .collection('users')
      .updateOne({ isServerIdentity: true }, { $set: { role: 'Admin' } });
    await this.decrypt(identity, this.secretKey);
    return identity!;
  }

  private decrypt(identity: any, secret: string) {
    let cipher = identity?.key?.secret;
    const algorithm = 'aes-256-ctr';
    const splitted = cipher.split(',');
    const iv = splitted[0];
    const hash = splitted[1];
    const decipher = crypto.createDecipheriv(
      algorithm,
      secret,
      Buffer.from(iv, 'hex'),
    );
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(hash, 'hex')),
      decipher.final(),
    ]);
    identity.key.secret = decrypted.toString();
  }

  async close() {
    await this.client.close();
  }
}
