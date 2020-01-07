const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      // store sequelize object on request for later use
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize
  // force: true recreates tables
  //.sync({ force: true })
  .sync()
  .then(_ => {
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) {
      return User.create({ name: 'Brent', email: 'test@test.com' });
    }
    return user; // automatically returns a promise because we're in a then block
  })
  .then(user => {
    // The instructor didn't need this; I feel like hasOne assoc should limit based on the keys but it doesn't
    // After looking at the course Q&A other people arrived at this conclusion as well,
    // I'm just rolling with this for now and if I use SQL later on I can dig deeper
    return user.getCart().then(cart => {
      if (!cart) return user.createCart();
      return cart;
    });
  })
  .then(_ => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
