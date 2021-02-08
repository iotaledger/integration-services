import { MongoClient } from 'mongodb';

// TODO env vars
const url = 'mongodb://root:rootpassword@0.0.0.0:27017';
const dbName = 'e-commerce-audit-log';

export class MongoDbService {
  public static client: MongoClient;
  public static db: any;

  private static getCollection(collectionName: string) {
    if (!MongoDbService.db) {
      return null;
    }
    return MongoDbService.db.collection(collectionName);
  }

  static async getDocument<T>(collectionName: string, query: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const collection = MongoDbService.getCollection(collectionName);
      if (!collection) {
        return resolve(null);
      }

      collection.find(query).toArray(function (err: Error, docs: any) {
        resolve(docs);
      });
    });
  }

  static async insertDocument(collectionName: string, data: any) {
    return new Promise((resolve, reject) => {
      const collection = MongoDbService.getCollection(collectionName);
      if (!collection) {
        return resolve(null);
      }
      collection.insertMany([data], function (err: Error, result: any) {
        if (err != null || result.ops.length === 0) {
          throw err;
        }
        console.log('Document inserted!');
        resolve(result);
      });
    });
  }

  static async connect(): Promise<MongoClient> {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, function (err: Error, client: MongoClient) {
        console.log('Connected successfully to mongo db');
        MongoDbService.client = client;
        MongoDbService.db = client.db(dbName);

        resolve(client);
      });
    });
  }

  public static disconnect(): void {
    MongoDbService.client.close();
  }
}
