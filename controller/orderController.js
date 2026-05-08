import Order from '../models/orderModel.js';
import { createOne, deleteOne, getAll, getOne ,updateOne, deleteAll} from './hendlerFactory.js';

// Create Order -----------------------------------------------------------------------------------
export const createOrder = createOne(Order);

// Get All Orders -----------------------------------------------------------------------------------
export const getAllOrders = getAll(Order);

// Get One Order -----------------------------------------------------------------------------------
export const getOrder = getOne(Order);

// Update Order -----------------------------------------------------------------------------------
export const updateOrder = updateOne(Order);

// Mark Order As Done -----------------------------------------------------------------------------------
export const markOrderAsDone = async (req, res, next) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, {
      status: 'done',
    });

    res.redirect(`/admin/cashier/${process.env.ADMIN_PASSWORD}`);
  } catch (err) {
    console.error(err);
    return next(new AppError('Error updating order status', 500));
  }
};

// Mark Order As Paid -----------------------------------------------------------------------------------
export const markOrderAsPaid = async (req, res, next) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, {
      statusPayment: 'paid',
    });

    res.redirect(`/admin/pay/${process.env.ADMIN_PASSWORD}`);
  } catch (err) {
    console.error(err);
    return next(new AppError('Error updating order status', 500));
  }
};
// Delete Order -----------------------------------------------------------------------------------
export const deleteOrder = deleteOne(Order);

// Delete All Orders -----------------------------------------------------------------------------------
export const deleteAllOrders = deleteAll(Order);
