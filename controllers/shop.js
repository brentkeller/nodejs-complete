const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts;
  Product.find()
    .countDocuments()
    .then(count => {
      totalProducts = count;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        currentPage: page,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
        // I'm not using these in this app but they could be useful for other pagination scenarios
        totalProducts,
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: `/products`,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts;
  Product.find()
    .countDocuments()
    .then(count => {
      totalProducts = count;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
        // I'm not using these in this app but they could be useful for other pagination scenarios
        totalProducts,
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: user.cart.items,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteItem = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  /*
  Note: This approach of creating the order based on a GET request after the redirect from Stripe checkout
  is not really secure. Instead you should let stripe tell you that a payment is successful via a webhook.
  This probably involves creating the order this way but not fulfilling it until the webhook is received.
  The Stripe docs are great and provide guidance for this sort of thing, check them for the latest recommendations
  */
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(p => {
        return {
          productData: { ...p.productId._doc },
          quantity: p.quantity,
        };
      });
      const order = new Order({
        user: {
          name: user.name,
          userId: user._id,
        },
        products,
      });
      return order.save();
    })
    .then(() => req.user.clearCart())
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then(order => {
      if (!order) return next(new Error('Order not found'));
      if (order.user.userId.toString() !== req.user._id.toString())
        return next(new Error('Order not found'));
      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join('data', 'invoices', invoiceName);

      // // preloading data in memory before serving
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) return next(err);
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     `inline; filename="${orderId}.pdf"`,
      //   );
      //   res.send(data);
      // });

      // // stream file from disk to response
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', `inline; filename="${orderId}.pdf"`);
      // file.pipe(res);

      // build invoice on the fly using PDFKit
      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${orderId}.pdf"`);
      // write the invoice to disk and the response
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', { underline: true });
      pdfDoc.text('--------------------------------');
      let totalPrice = 0;
      order.products.forEach(p => {
        totalPrice += p.quantity * p.productData.price;
        pdfDoc
          .fontSize(16)
          .text(
            `${p.productData.title} - ${p.quantity} x $${p.productData.price}`,
          );
      });
      pdfDoc.text('---------------');
      pdfDoc.fontSize(20).text(`Total price: $${totalPrice}`);
      pdfDoc.end();
    })
    .catch(err => next(err));
};

exports.getCheckout = (req, res, next) => {
  let products;
  let totalPrice = 0;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      products = user.cart.items;
      totalPrice = products.reduce(
        (total, item) => total + item.quantity * item.productId.price,
        0.0,
      );
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(p => {
          return {
            name: p.productId.title,
            description: p.productId.description || 'No description',
            amount: p.productId.price * 100, // stripe wants amount in cents
            currency: 'usd',
            quantity: p.quantity,
          };
        }),
        success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`,
      });
    })
    .then(session => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products,
        totalPrice: totalPrice.toFixed(2),
        sessionId: session.id,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
