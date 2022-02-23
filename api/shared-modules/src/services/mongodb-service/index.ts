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
	UpdateOneOptions,
	CollectionInsertManyOptions,
	CollectionInsertOneOptions,
	FindOneOptions,
	CommonOptions
} from 'mongodb';
import { Logger } from '../../utils/logger';
import * as _ from 'lodash';

const logger = Logger.getInstance();
type WithoutProjection<T> = T & { fields?: undefined; projection?: undefined };
// type WithProjection<T extends { projection?: any }> = T & { projection: NonNullable<T['projection']> };

/**
 * MongoDbService to establish a connection and create, read, update and delete (CRUD) documents in the database.
 *
 * @export
 * @class MongoDbService
 */
export class MongoDbService {
	public static client: MongoClient;
	public static db: Db;

	private static getCollection(collectionName: string): Collection | undefined {
		if (!MongoDbService.db) {
			logger.error('Database not found!');
			return undefined;
		}
		return MongoDbService.db.collection(collectionName);
	}

	static async getDocument<T>(collectionName: string, query: FilterQuery<T>, options?: WithoutProjection<FindOneOptions<T>>): Promise<T> {
		const collection = MongoDbService.getCollection(collectionName);
		return collection?.findOne(query, options);
	}

	static async getDocuments<T>(
		collectionName: string,
		query: FilterQuery<T>,
		options?: WithoutProjection<FindOneOptions<T>>
	): Promise<T[] | undefined> {
		const collection = MongoDbService.getCollection(collectionName);
		return collection?.find(query, options).toArray();
	}

	static async insertDocument<T>(
		collectionName: string,
		data: any,
		options?: CollectionInsertOneOptions
	): Promise<InsertOneWriteOpResult<WithId<T>> | undefined> {
		const ommitedData: any = _.omitBy(data, _.isUndefined);
		const collection = MongoDbService.getCollection(collectionName);
		return collection?.insertOne(ommitedData, options);
	}

	static async insertDocuments(
		collectionName: string,
		data: any[],
		options?: CollectionInsertManyOptions
	): Promise<InsertWriteOpResult<any> | undefined> {
		const ommitedData: any = data.map((d) => _.omitBy(d, _.isUndefined));
		const collection = MongoDbService.getCollection(collectionName);
		return collection?.insertMany(ommitedData, options);
	}

	static async updateDocument(
		collectionName: string,
		query: any,
		update: any,
		options?: UpdateOneOptions
	): Promise<UpdateWriteOpResult | undefined> {
		const ommitedUpdate: any = _.omitBy(update, _.isUndefined);
		const collection = MongoDbService.getCollection(collectionName);
		return collection?.updateOne(query, ommitedUpdate, options);
	}

	static async removeDocument(collectionName: string, query: any, options?: CommonOptions): Promise<DeleteWriteOpResultObject | undefined> {
		const collection = MongoDbService.getCollection(collectionName);
		return collection?.deleteOne(query, options);
	}

	static async removeDocuments(
		collectionName: string,
		query: any,
		options?: CommonOptions
	): Promise<DeleteWriteOpResultObject | undefined> {
		const collection = MongoDbService.getCollection(collectionName);
		return collection?.deleteMany(query, options);
	}

	/**
	 * Get plain object for fields having a value not null and not undefined.
	 *
	 * @static
	 * @param {{ [key: string]: any }} fields Map of fields. For instance: { "height": 10, "length": 20, "unit": "metres", "depth": undefined }
	 * @return {*}  {{ [key: string]: any }} Map of fields with no fields having null or undefined. For instance: { "height": 10, "length": 20, "unit": "metres" }
	 * @memberof MongoDbService
	 */
	static getPlainObject(fields: { [key: string]: any }): { [key: string]: any } {
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
	static async connect(url: string, dbName: string): Promise<MongoClient | undefined> {
		if (MongoDbService.client) {
			return undefined;
		}

		return new Promise((resolve, reject) => {
			const options: MongoClientOptions = {
				useUnifiedTopology: true
			} as MongoClientOptions;

			MongoClient.connect(url, options, function (err: Error, client: MongoClient) {
				if (err != null) {
					logger.error('could not connect to mongodb');
					reject(err);
					return;
				}
				logger.log('Successfully connected to mongodb');
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
