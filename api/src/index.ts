import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import { errorMiddleware } from './middlewares/error';
import { authenticationRouter, channelInfoRouter, userRouter } from './routes/router';
import { MongoDbService } from './services/mongodb-service';
import { CONFIG } from './config';
import morgan from 'morgan';

const app = express();
const port = CONFIG.port;
const dbUrl = CONFIG.databaseUrl;
const dbName = CONFIG.databaseName;
const version = CONFIG.apiVersion;
const loggerMiddleware = morgan('combined');

function useRouter(app: express.Express, prefix: string, router: express.Router) {
  console.log(router.stack.map((r) => `${Object.keys(r?.route?.methods)?.[0].toUpperCase()}  ${prefix}${r?.route?.path}`));
  app.use(prefix, router);
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(loggerMiddleware);

const prefix = `/api/${version}`;

useRouter(app, prefix + '/channel-info', channelInfoRouter);
useRouter(app, prefix + '/users', userRouter);
useRouter(app, prefix + '/authentication', authenticationRouter);

app.use(errorMiddleware);

// TODO check if server identity env var is set otherwise throw an error!

app.listen(port, async () => {
  console.log(`Started API Server on port ${port}`);
  await MongoDbService.connect(dbUrl, dbName);
});
