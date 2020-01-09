const mongodb = require('mongodb');
const { validationResult } = require('express-validator');

const Product = require('../models/product');
const { deleteFile } = require('../util/file');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    product: {
      title: '',
      price: '',
      description: '',
    },
    errorMessage: '',
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description,
      },
      errorMessage: 'Attached file is not an image',
      validationErrors: [],
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title,
    imageUrl,
    price,
    description,
    userId: req.user,
  });
  product
    .save()
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit === 'true';
  if (!editMode) return res.redirect('/');

  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) return res.redirect('/');

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        hasError: false,
        product: product,
        errorMessage: '',
        validationErrors: [],
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const prodId = req.body.productId;

  // Could include this validation to enforce changing the image every edit,
  // but for now keep old image if none is provided
  // if (!image) {
  //   return res.status(422).render('admin/edit-product', {
  //     pageTitle: 'Edit Product',
  //     path: '/admin/edit-product',
  //     editing: true,
  //     hasError: true,
  //     product: {
  //       _id: prodId,
  //       title,
  //       price,
  //       description,
  //     },
  //     errorMessage: 'Attached file is not an image',
  //     validationErrors: [],
  //   });
  // }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        _id: prodId,
        title,
        price,
        description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = title;
      product.price = price;
      product.description = description;
      // Only update imageUrl if a new image was provided
      if (image) {
        deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }

      return product
        .save()
        .then(result => {
          res.redirect('/admin/products');
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Converted to "DELETE" method
// exports.postDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product.findOne({ _id: prodId, userId: req.user._id })
//     .then(product => {
//       deleteFile(product.imageUrl);
//       return Product.deleteOne({ _id: prodId, userId: req.user._id });
//     })
//     .then(() => {
//       res.redirect('/admin/products');
//     })
//     .catch(err => next(error));
// };

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findOne({ _id: prodId, userId: req.user._id })
    .then(product => {
      deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      res.status(200).json({ message: 'Success' });
    })
    .catch(err => {
      res.status(200).json({ message: 'error occurred' });
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // Specify what fields to include or exclude in the find operation
    // .select('title price -_id')
    // Populate ref objects, optionally specifying which fields to include
    // .populate('userId', 'name')
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
