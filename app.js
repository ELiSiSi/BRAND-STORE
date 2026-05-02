import compression from 'compression';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import mongoose from 'mongoose';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import xss from 'xss-clean';
dotenv.config();

import adminRouter from './routes/adminRouter.js';
import productRouter from './routes/productRouter.js';
import offerRouter from './routes/offerRouter.js';
import orderRouter from './routes/orderRouter.js';
import viewRouter from './routes/viewRouter.js';
import reviewRouter    from './routes/reviewRouter.js';
import AppError from './utils/appError.js';

const MONGO_URI = process.env.MONGO_URI;
const app = express();
const port = process.env.PORT || 3000;

// حل مشكلة __dirname في ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log('🔍 VIEWS DIR =', app.get('views'));

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//-----------------------------------------------------------------------------------------
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api', limiter);

// ✅ Middleware للـ nonce و stripePublicKey
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  res.locals.stripePublicKey = process.env.STRIPE_PUBLISHABLE_KEY;
  next();
});

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 2) تنظيف البيانات من NoSQL Injection
app.use(mongoSanitize());

// 3) تنظيف البيانات من XSS Attack
app.use(xss());

//-----------------------------------------------------------------------------------------
// app.use(morgan('dev'));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 4) يمنع تكرار نفس Query Parameter أكتر من مرة
app.use(hpp());

//-----------------------------------------------------------------------------------------
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
console.log('VIEWS PATH 👉', app.get('views'));

// تحميل أسرع للصفحات استهلاك إنترنت أقل
app.use(compression());
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error(err));

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
//--------------------------------------------------------------------------------------------
// =================================== The Routes ============================================
//--------------------------------------------------------------------------------------------
// ✅ Middleware لتمرير Stripe key لكل الصفحات
// Ignore .well-known requests
app.get('/.well-known/*', (req, res) => res.status(204).end());

// Routes
app.use('/api/v1/product', productRouter);
app.use('/api/v1/offer', offerRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/', viewRouter);
app.use('/admin', adminRouter);

// 404 handler
app.all('*', (req, res, next) => {
  const err = new Error('Page Not Found');
  err.statusCode = 404;
  next(err);
});

// ✅ ONE Global Error Handler فقط
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // API → JSON
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Views → render page
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    message: err.message,
    error: err,
  });
});

//----------------------------------------------------------------------------------------------------------

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('❌ Uncaught Exception 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

//-----------------------------------------------------------------------------------------

export default app;
