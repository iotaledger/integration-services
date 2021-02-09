import express from 'express';
require('dotenv').config();
import { loggerMiddleware } from './middlewares/logger';
import { errorMiddleware } from './middlewares/error';
import { channelInfoRouter } from './routes/router';
import { MongoDbService } from './services/mongodb-service';
import { CONFIG } from './config';

const app = express();
const port = CONFIG.port;
const dbUrl = CONFIG.databaseUrl;
const dbName = CONFIG.databaseName;
const version = CONFIG.apiVersion;

function useRouter(app: express.Express, prefix: string, router: express.Router) {
  const path = `/${version}${prefix}`;
  console.log(router.stack.map((r) => Object.keys(r.route.methods)[0].toUpperCase() + '  ' + path + r.route.path));
  app.use(path, router);
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(loggerMiddleware);

useRouter(app, '/channel-info-service', channelInfoRouter);

app.use(errorMiddleware);

app.listen(port, async () => {
  console.log(`Started API Server on port ${port}`);
  await MongoDbService.connect(dbUrl, dbName);
});
