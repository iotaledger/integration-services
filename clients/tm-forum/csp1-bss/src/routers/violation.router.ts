import { Router } from 'express';

import { ViolationRoutes } from '../routes/violation.route';

const { writeViolation } = new ViolationRoutes();
export const ViolationRouter = Router();

ViolationRouter.post('/SLAViolationCreateNotification', writeViolation);
