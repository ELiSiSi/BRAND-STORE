import mongoose from 'mongoose';

import Product from '../models/productModel.js';
import Offer from '../models/offerModel.js';
 import AppError from '../utils/appError.js';


// homepage -----------------------------------------------------------------------------------
export const homepage = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.status(200).render('home', {
      products,
      title: 'Home',
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};
//  productspage -----------------------------------------------------------------------------------
export const productspage = async (req, res, next) => {
  try {
    const Offers = await Offer.find();
    const products = await Product.find();
    res.status(200).render('products', {
      products,
      Offers,
      title: 'Products',
    });
  } catch (err) {
    return next(new AppError('No document found with that ID', 404));
  }
};

// item page -----------------------------------------------------------------------------------
export const itemPage = async (req, res, next) => {
  try {
    const item = await Product.findOne({ slug: req.params.slug });
    const products = await Product.find();

    if (!item) {
      return next(new AppError('المنتج غير موجود', 404));
    }

    let ProCat = await Product.find({
  category: item.category,
  _id: { $ne: item._id },
}).limit(4);

    if (!ProCat || ProCat.length === 0) {
      ProCat = await Product.find({
        _id: { $ne: item._id },
      }).limit(4);
    }

    res.status(200).render('item', {
      item,
      ProCat,
      products,
      title: item.name,
    });
  } catch (err) {
    return next(err);
  }
};

// offersPage -----------------------------------------------------------------------------------
 export const offersPage = async (req, res, next) => {
  try {
    const offers = await Offer.find();
    const products = await Product.find();


    res.status(200).render('offers', {
      offersList: offers,
      title: 'Offers',

    });
  } catch (err) {
    console.error('❌ Error:', err);
    return next(new AppError('Failed to load offers page', 500));
  }
};


// cartpage -----------------------------------------------------------------------------------
export const cartpage = async (req, res, next) => {
  try {
        const products = await Product.find();

     res.status(200).render('cart', {
       title: 'Cart',
        products,
    });
  } catch (err) {
    return next(new AppError('No document found with that ID', 404));
  }
};

// reviewPage -----------------------------------------------------------------------------------
export const reviewPage = (req, res) => {
  res.render('review', { title: 'Review' });
};




