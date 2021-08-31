import { Router } from 'express';

import { ServiceOrderRoutes } from '../routes/service-order.route';

const { writeServiceOrderCreateEvent } = new ServiceOrderRoutes();
export const serviceOrderRouter = Router();

serviceOrderRouter.post('/listener/serviceOrderCreateEvent', writeServiceOrderCreateEvent);
