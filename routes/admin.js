const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.use(isAuth);

// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

productValidators = [
  body('title', 'Title should be at least 3 chars')
    .isString()
    .isLength({ min: 3 })
    .trim(),
  body('price', 'Invalid price').isFloat(),
  body('description', 'Description should be between 3 and 400 chars')
    .isLength({ min: 3, max: 400 })
    .trim(),
];

// /admin/add-product => POST
router.post('/add-product', productValidators, adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post(
  '/edit-product',
  productValidators,
  adminController.postEditProduct,
);

//router.post('/delete-product', adminController.postDeleteProduct);

router.delete('/product/:productId', adminController.deleteProduct);

module.exports = router;
