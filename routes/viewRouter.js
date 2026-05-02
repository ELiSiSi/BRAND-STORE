import express from "express";
const router = express.Router();

import {
  homepage,
  productspage,
  itemPage,
  offersPage,
  cartpage,
  reviewPage,
} from '../controller/viewController.js';

// View Routes
// router.get('/home', homepage);
router.get('/', productspage);
router.get('/products', productspage);
router.get('/products/:slug', itemPage);

router.get('/offers', offersPage);
router.get('/cart', cartpage);
router.get('/review', reviewPage);


export default router;
