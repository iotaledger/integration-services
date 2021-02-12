import {
  Db,
  MongoClient,
  MongoClientOptions,
  Collection,
  UpdateWriteOpResult,
  InsertOneWriteOpResult,
  WithId,
  DeleteWriteOpResultObject,
  FilterQuery,
  InsertWriteOpResult,
  UpdateOneOptions
} from 'mongodb';

/**
 * MongoDbService to establish a connection and create, read, update and delete (CRUD) documents in the database.
 *
 * @export
 * @class MongoDbService
 */
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

  static async getDocument<T>(collectionName: string, query: FilterQuery<T>): Promise<T> {
    const collection = MongoDbService.getCollection(collectionName);
    return collection.findOne(query);
  }

  static async getDocuments<T>(collectionName: string, query: FilterQuery<T>): Promise<T[] | null> {
    const collection = MongoDbService.getCollection(collectionName);
    return collection.find(query).toArray();
  }

  static async insertDocument<T>(collectionName: string, data: any): Promise<InsertOneWriteOpResult<WithId<T>> | null> {
    const collection = MongoDbService.getCollection(collectionName);
    return collection.insertOne(data);
  }

  static async insertDocuments(collectionName: string, data: any): Promise<InsertWriteOpResult<any>> {
    const collection = MongoDbService.getCollection(collectionName);
    return collection.insertMany(data);
  }

  static async updateDocument(collectionName: string, query: any, update: any, options?: UpdateOneOptions): Promise<UpdateWriteOpResult | null> {
    const collection = MongoDbService.getCollection(collectionName);
    return collection.updateOne(query, update, options);
  }

  static async removeDocument(collectionName: string, query: any): Promise<DeleteWriteOpResultObject> {
    const collection = MongoDbService.getCollection(collectionName);
    return collection.deleteOne(query);
  }

  /**
   * Get update object for fields having a value not null and not undefined.
   *
   * @static
   * @param {{ [key: string]: any }} fields Map of fields. For instance: { "height": 10, "length": 20, "unit": "metres", "depth": undefined }
   * @return {*}  {{ [key: string]: any }} Map of fields with no fields having null or undefined. For instance: { "height": 10, "length": 20, "unit": "metres" }
   * @memberof MongoDbService
   */
  static getUpdateObject(fields: { [key: string]: any }): { [key: string]: any } {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const updateObject = values.reduce((acc, value, index) => {
      if (value == null) {
        return acc;
      }
      const key = keys[index];

      return {
        ...acc,
        [key]: value
      };
    }, {});

    return updateObject;
  }
  /**
   * Connect to the mongodb.
   *
   * @static
   * @param {string} url The url to the mongodb.
   * @param {string} dbName The name of the database.
   * @return {*}  {Promise<MongoClient>}
   * @memberof MongoDbService
   */
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

  /**
   * Disconnect from the mongodb.
   *
   * @static
   * @return {*}  {Promise<void>}
   * @memberof MongoDbService
   */
  public static disconnect(): Promise<void> {
    return MongoDbService.client.close();
  }
}
