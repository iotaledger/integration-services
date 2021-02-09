import {
  Db,
  MongoClient,
  MongoClientOptions,
  Collection,
  UpdateWriteOpResult,
  InsertOneWriteOpResult,
  WithId,
  DeleteWriteOpResultObject
} from 'mongodb';

export class MongoDbService {
  public static client: MongoClient;
  public static db: Db;

  private static getCollection(collectionName: string): Collection | null {
    if (!MongoDbService.db) {
      console.error(`Database not found!`);
      return null;
    }
    return MongoDbService.db.collection(collectionName);
  }

  static async getDocument<T>(collectionName: string, query: any): Promise<T> {
    const collection = MongoDbService.getCollection(collectionName);
    return collection.findOne(query);
  }

  static async getDocuments<T>(collectionName: string, query: any): Promise<T[] | null> {
    const collection = MongoDbService.getCollection(collectionName);
    return collection.find(query).toArray();
  }

  static async insertDocument<T>(collectionName: string, data: any): Promise<InsertOneWriteOpResult<WithId<T>> | null> {
    const collection = MongoDbService.getCollection(collectionName);
    return collection.insertOne(data);
  }

  static async insertDocuments(collectionName: string, data: any[]) {
    const collection = MongoDbService.getCollection(collectionName);
    return collection.insertMany(data);
  }

  static async upsertDocument(collectionName: string, query: any, update: any): Promise<UpdateWriteOpResult | null> {
    const collection = MongoDbService.getCollection(collectionName);
    const options = {};
    return collection.updateOne(query, update, options);
  }

  static async removeDocument(collectionName: string, query: any): Promise<DeleteWriteOpResultObject> {
    const collection = MongoDbService.getCollection(collectionName);
    return collection.deleteOne(query);
  }

  static async connect(url: string, dbName: string): Promise<MongoClient> {
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
