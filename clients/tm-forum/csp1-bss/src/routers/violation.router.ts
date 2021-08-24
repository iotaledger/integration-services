import { Router } from 'express';

import { ViolationRoutes } from '../routes/violation.route';

const { writeSlaViolationCreateEvent } = new ViolationRoutes();
export const violationRouter = Router();

violationRouter.post('/listener/slaViolationCreateEvent', writeSlaViolationCreateEvent);
