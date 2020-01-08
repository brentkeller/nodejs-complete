const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  //res.setHeader('Set-Cookie', 'loggedIn=true');
  const email = req.body.email;
  User.findOne()
    .byEmail(email)
    .then(user => {
      // TODO: verify password
      req.session.user = user;
      req.session.isLoggedIn = true;
      // Guarantee our session is persisted in DB before redirecting
      req.session.save(err => {
        console.log(err);
        res.redirect('/');
      });
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    res.redirect('/');
  });
};
