import { ApiVersion, ManagerConfig, ClientConfig } from 'iota-is-sdk';

import * as dotenv from 'dotenv';
dotenv.config();

export const defaultConfig: ClientConfig = {
    apiKey: process.env.API_KEY,
    baseUrl: process.env.API_URL,
    apiVersion: ApiVersion.v01
};

export const defaultManagerConfig: ManagerConfig = {
    mongoURL: process.env.MONGO_URL!,
    databaseName: process.env.DB_NAME!,
    secretKey: process.env.SECRET_KEY!
}