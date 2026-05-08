import express from 'express';

const router = express.Router();

import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrder,
  updateOrder,
  markOrderAsDone,
  markOrderAsPaid,
  deleteAllOrders,
} from '../controller/orderController.js';
import { get } from 'mongoose';

router.route('/').post(createOrder).get(getAllOrders);
router.route('/:id').get(getOrder).patch(updateOrder).delete(deleteOrder);
router.post('/:id/done', markOrderAsDone);
router.post('/:id/paid', markOrderAsPaid);
router.route('/').delete(deleteAllOrders);

export default router;
