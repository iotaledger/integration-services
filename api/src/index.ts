import express from 'express';
import { loggerMiddleware } from './middlewares/logger';
import userContextRouter from './routes/user-context-routes';

const app = express();
const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

function userRouter(app: express.Express, path: string, router: express.Router) {
  console.log(router.stack.map((r) => ({ basePath: path, path: r.route.path, methods: r.route.methods })));
  app.use(path, router);
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(loggerMiddleware);

userRouter(app, 'user-service', userContextRouter);

app.listen(port, () => {
  console.log(`Started API Server on port  ${port}`);
});
