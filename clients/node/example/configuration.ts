import { ApiVersion } from 'integration-services-node';

import * as dotenv from 'dotenv';
dotenv.config();

export const defaultConfig = {
    apiKey: process.env.API_KEY,
    baseUrl: "http://localhost:3000",
    apiVersion: ApiVersion.v01
};
