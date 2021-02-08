import { MongoClient, MongoClientOptions, Collection, UpdateWriteOpResult, InsertOneWriteOpResult, WithId, DeleteWriteOpResultObject } from 'mongodb';

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
    const collection = MongoDbService.db.collection(collectionName);
    if (!collection) {
      console.error(`Collection ${collectionName} not found!`);
    }
    return collection;
  }

  static async getDocument<T>(collectionName: string, query: any): Promise<T> {
    const collection = MongoDbService.getCollection(collectionName);
    return collection?.findOne(query);
  }

  static async getDocuments<T>(collectionName: string, query: any): Promise<T[] | null> {
    const collection = MongoDbService.getCollection(collectionName);
    return collection?.find(query).toArray();
  }

  static async insertDocument<T>(collectionName: string, data: any): Promise<InsertOneWriteOpResult<WithId<T>> | null> {
    const collection = MongoDbService.getCollection(collectionName);
    return collection?.insertOne(data);
  }

  static async insertDocuments(collectionName: string, data: any[]) {
    const collection = MongoDbService.getCollection(collectionName);
    return collection?.insertMany(data);
  }

  static async upsertDocument(collectionName: string, query: any, update: any): Promise<UpdateWriteOpResult | null> {
    const collection = MongoDbService.getCollection(collectionName);
    const options = {};
    return collection?.updateOne(query, update, options);
  }

  static async removeDocument(collectionName: string, query: any): Promise<DeleteWriteOpResultObject> {
    const collection = MongoDbService.getCollection(collectionName);
    const reult = await collection?.deleteOne(query);
    throw new Error('AH FAILED!');
    return reult;
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
