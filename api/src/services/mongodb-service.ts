import { MongoClient, MongoClientOptions, Collection, UpdateWriteOpResult } from 'mongodb';

// TODO env vars
const url = 'mongodb://root:rootpassword@0.0.0.0:27017';
const dbName = 'e-commerce-audit-log';

export class MongoDbService {
  public static client: MongoClient;
  public static db: any;

  private static getCollection(collectionName: string): Collection | null {
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
      // TODO use findone!
      collection.find(query).toArray(function (err: Error, docs: any) {
        if (err != null) {
          reject(err);
          return;
        }
        resolve(docs);
      });
    });
  }

  static async getDocuments<T>(collectionName: string, query: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const collection = MongoDbService.getCollection(collectionName);
      if (!collection) {
        return resolve(null);
      }
      // TODO use findone!
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

  static async upsertDocument(collectionName: string, query: any, update: any): Promise<UpdateWriteOpResult | null> {
    const collection = MongoDbService.getCollection(collectionName);
    if (!collection) {
      console.error('Collection not found!');
      return null;
    }
    const options = {};
    return collection.updateOne(query, update, options);
  }

  static async removeDocument(collectionName: string, query: any) {
    return new Promise((resolve, reject) => {
      const collection = MongoDbService.getCollection(collectionName);
      if (!collection) {
        return resolve(null);
      }
      collection.deleteOne(query, function (err: Error, result: any) {
        if (err != null) {
          throw err;
        } else if (result.result.n === 0) {
          console.log('No document to delete for: ', query);
          return resolve(null);
        }
        console.log('Removed the document!');
        resolve(result);
      });
    });
  }

  static async connect(): Promise<MongoClient> {
    return new Promise((resolve, reject) => {
      const options: MongoClientOptions = {
        useUnifiedTopology: true
      };

      MongoClient.connect(url, options, function (err: Error, client: MongoClient) {
        if (err != null) {
          console.error('Could not connect to mongodb');
          reject(err);
          return;
        }
        console.log('Successfully connected to mongodb');
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
