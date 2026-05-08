import Product from '../models/productModel.js';
import Offer from '../models/offerModel.js';
import Order from '../models/orderModel.js';
import Review from '../models/reviewModel.js';
import AppError from '../utils/appError.js';



export const adminPage = async (req, res, next) => {
  try {
    const [totalOrders, pendingOrders, doneOrders, totalRevenueResult] =
      await Promise.all([
        // إجمالي الطلبات
        Order.countDocuments(),

        // الطلبات غير المدفوعة
        Order.countDocuments({ statusPayment: 'no' }),

        // الطلبات المدفوعة
        Order.countDocuments({ statusPayment: 'paid' }),

        // إجمالي الأرباح من الطلبات المدفوعة فقط
        Order.aggregate([
          { $match: { statusPayment: 'paid' } },
          {
            $group: {
              _id: null,
              total: { $sum: '$total' },
            },
          },
        ]),
      ]);

    const stats = {
      totalOrders,
      pendingOrders,
      doneOrders,
      totalRevenue: totalRevenueResult[0]?.total || 0,
    };

    const link = process.env.ADMIN_PASSWORD || 'default';
    const link2 = process.env.CASHIER_PASSWORD || 'default';

    res.render('admin/dashboard', {
      title: 'Dashboard',
      pageTitle: 'لوحة الإدارة',
      page: 'dashboard',
      stats,
      link,
      link2,
    });
  } catch (err) {
    console.error('Error in adminPage:', err);
    return next(new AppError('خطأ في تحميل لوحة التحكم', 500));
  }
};

// product Page -----------------------------------------------------------------------------------
export const productPage = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).render('admin/products', {
      title: 'Products',
      products,
    });
  } catch (err) {
    return next(new AppError('Error fetching products', 404));
  }
};

// Offer Page -----------------------------------------------------------------------------------
export const offerPage = async (req, res, next) => {
  try {
    const offers = await Offer.find({}).sort({ createdAt: -1 });
    res.status(200).render('admin/offers', {
      title: 'Offers',
      offers,
    });
  } catch (err) {
    return next(new AppError('Error fetching offers', 404));
  }
};
// order Page -----------------------------------------------------------------------------------
export const orderPage = async (req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    const totalpay = await Order.find({ statusPayment: 'paid' }).sort({ createdAt: -1 });

    res.status(200).render('admin/orders', {
      title: 'Orders',
      orders,
      totalpay,
    });
  } catch (err) {
    return next(new AppError('Error fetching orders', 404));
  }
};


// cashier Page -----------------------------------------------------------------------------------
export const cashierPage = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: 'pending' }).sort({
      createdAt: -1,
    });
    res.status(200).render('admin/cashier', {
      title: 'Cashier',
      orders,
    });
  } catch (err) {
    return next(new AppError('Error fetching orders', 404));
  }
};

// pay Page -----------------------------------------------------------------------------------
export const payPage = async (req, res, next) => {
  try {
const orders = await Order.find({
  statusPayment: 'no',
  status: 'done',
});

    res.status(200).render('admin/pay', {
      title: 'pay',
      orders,
    });
  } catch (err) {
    return next(new AppError('Error fetching orders', 404));
  }
};

// AllReviews -----------------------------------------------------------------------------------
export const AllReviews = async (req, res) => {
  const reviews = await Review.find({}).sort({ createdAt: -1 });
  res.render('admin/AllReviews', { reviews , title: 'All Reviews' });
};
