const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const defaultName = 'Brent';
const defaultEmail = 'test@test.com';
const userId = '5e14ed1592309c7b4c9a53c6';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById(userId)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect('mongodb://127.0.0.1:27017/node-complete', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(client => {
    console.log('mongoose connected');
    User.findById(userId)
      .then(user => {
        if (!user) {
          user = new User({
            name: defaultName,
            email: defaultEmail,
            cart: { items: [] },
          });
          return user.save();
        }
        return user;
      })
      .then(user => {
        app.listen(3000);
      })
      .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
