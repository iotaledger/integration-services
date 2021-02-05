import express from 'express';
import { loggerMiddleware } from './middlewares/logger';
import { errorMiddleware } from './middlewares/error';
import channelInfoRouter from './routes/channel-info/router';

const app = express();
const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

function useRouter(app: express.Express, path: string, router: express.Router) {
  console.log(router.stack.map((r) => Object.keys(r.route.methods)[0].toUpperCase() + '  ' + path + r.route.path));
  app.use(path, router);
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(loggerMiddleware);

useRouter(app, '/channel-info-service', channelInfoRouter);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Started API Server on port  ${port}`);
});
