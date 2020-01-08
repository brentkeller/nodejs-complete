const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
  });
};

exports.postLogin = (req, res, next) => {
  //res.setHeader('Set-Cookie', 'loggedIn=true');
  const email = req.body.email;
  const password = req.body.password;
  User.findOne()
    .byEmail(email)
    .then(user => {
      if (!user) res.redirect('/login');
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            // Guarantee our session is persisted in DB before redirecting
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    res.redirect('/');
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
  });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  // TODO: add validation
  User.findOne()
    .byEmail(email)
    .then(existingUser => {
      if (existingUser) return res.redirect('/signup');
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            name,
            email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then(_result => {
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};
