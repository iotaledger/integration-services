import { MongoClient } from 'mongodb';
import { ManagerConfig } from '../models/managerConfig';
import { IdentityKeys } from '../models/types';
const crypto = require('crypto');

export class Manager {
  private client: MongoClient;
  private connected: boolean;

  constructor(private config: ManagerConfig) {
    this.client = new MongoClient(this.config.mongoURL);
    this.connected = false;
  }

  private async tryConnect() {
    if (this.connected) {
      return
    }
    await this.client.connect();
    this.connected = true;
  }

  async getRootIdentity(): Promise<IdentityKeys> {
    this.tryConnect();
    const database = this.client.db(this.config.databaseName);
    const users = database.collection("users");
    const rootUser = await users.findOne({ isServerIdentity: true });
    const identities = database.collection('identity-keys');
    let identity = await identities.findOne<IdentityKeys>({
      id: rootUser?.id
    });
    await this.decrypt(identity, this.config.secretKey);
    return identity!;
  }

  async setRole(id: string, role: string): Promise<boolean> {
    this.tryConnect();
    const database = this.client.db(this.config.databaseName);
    const users = database.collection("users");
    const user = await users.findOneAndUpdate({
      id
    }, {
      $set: { role }
    }, {
      upsert: false
    })
    return !!user
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
