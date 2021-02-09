import { Config } from '../models/config';
import * as _ from 'lodash';

export const CONFIG: Config = {
  port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
  nodeUrl: process.env.IOTA_NODE_URL,
  apiVersion: process.env.API_VERSION,
  databaseUrl: process.env.DATABASE_URL,
  databaseName: process.env.DATABASE_NAME
};

const assertConfig = (config: Config) => {
  Object.values(config).map((value, i) => {
    if (_.isEmpty(value) && (isNaN(value) || value == null || value === '')) {
      console.log('========================================================');
      console.error('Env var is missing or invalid:', Object.keys(config)[i]);
      console.log('========================================================');
    }
  });
};

assertConfig(CONFIG);
