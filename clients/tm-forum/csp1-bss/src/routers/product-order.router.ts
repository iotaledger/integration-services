import { Router } from 'express';

import { ProductOrderRoutes } from '../routes/product-order.route';

const { forwardProductOrder } = new ProductOrderRoutes();
export const productOrderRouter = Router();

productOrderRouter.post('/productOrder', forwardProductOrder);
