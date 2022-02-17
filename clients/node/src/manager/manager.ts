import { MongoClient } from 'mongodb';
import { ManagerConfig } from '../models/managerConfig';
import { UserRoles } from '@iota-is/shared-modules/lib/models/types/user';

export class Manager {
  private client: MongoClient;
  private connected: boolean;

  constructor(private config: ManagerConfig) {
    this.client = new MongoClient(this.config.mongoURL);
    this.connected = false;
  }

  async setRole(id: string, role: UserRoles): Promise<boolean> {
    this.tryConnect();
    const database = this.client.db(this.config.databaseName);
    const users = database.collection('users');
    const user = await users.findOneAndUpdate(
      {
        id
      },
      {
        $set: { role }
      },
      {
        upsert: false
      }
    );
    await this.close();
    return !!user;
  }

  private async tryConnect() {
    if (this.connected) {
      return;
    }
    await this.client.connect();
    this.connected = true;
  }

  private async close() {
    await this.client.close();
    this.connected = false;
  }
}
