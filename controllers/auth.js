const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  }),
);

exports.getLogin = (req, res, next) => {
  const flashedErrors = req.flash('error');
  let errorMessage;
  if (flashedErrors.length > 0) errorMessage = flashedErrors[0];
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage,
    oldInput: {
      email: '',
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  // Basic example of setting header
  //res.setHeader('Set-Cookie', 'loggedIn=true');

  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      path: '/login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne()
    .byEmail(email)
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          pageTitle: 'Login',
          path: '/login',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email,
          },
          validationErrors: [],
        });
      }
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
          return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: 'Invalid email or password.',
            oldInput: {
              email,
            },
            validationErrors: [],
          });
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
  const flashedErrors = req.flash('error');
  let errorMessage;
  if (flashedErrors.length > 0) errorMessage = flashedErrors[0];

  res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    errorMessage,
    oldInput: {
      name: '',
      email: '',
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      pageTitle: 'Signup',
      path: '/signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        name,
        email,
      },
      validationErrors: errors.array(),
    });
  }
  bcrypt
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
      return transporter
        .sendMail({
          to: email,
          from: 'shop@node-complete.com',
          subject: 'Account created',
          html: `<p>Account created for email ${email}</p>`,
        })
        .catch(err => console.log(err));
    });
};

exports.getReset = (req, res, next) => {
  const flashedErrors = req.flash('error');
  let errorMessage;
  if (flashedErrors.length > 0) errorMessage = flashedErrors[0];

  res.render('auth/reset', {
    pageTitle: 'Reset Password',
    path: '/reset',
    errorMessage,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    const email = req.body.email;
    User.findOne()
      .byEmail(email)
      .then(existingUser => {
        if (!existingUser) {
          req.flash('error', 'Unknown email address.');
          return res.redirect('/reset');
        }
        existingUser.resetToken = token;
        const hourMs = 1000 * 60 * 60;
        // Token expires in 1 hour
        existingUser.resetTokenExpiration = Date.now() + hourMs;
        existingUser.save().then(_ => {
          return transporter
            .sendMail({
              to: email,
              from: 'shop@node-complete.com',
              subject: 'Shop: Reset password',
              html: `
              <p>You requested a pasword reset</p>
              <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
              `,
            })
            .then(_result => {
              res.redirect('/login');
            });
        });
      })
      .catch(err => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      if (!user) {
        req.flash('error', 'Unknown email address.');
        return res.redirect('/reset');
      } else {
        const flashedErrors = req.flash('error');
        let errorMessage;
        if (flashedErrors.length > 0) errorMessage = flashedErrors[0];

        res.render('auth/new-password', {
          pageTitle: 'Update Password',
          path: '/reset',
          errorMessage,
          userId: user._id.toString(),
          resetToken: token,
        });
      }
    })
    .catch(err => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const password = req.body.password;
  const userId = req.body.userId;
  const resetToken = req.body.resetToken;

  User.findOne({
    resetToken: resetToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then(user => {
      if (!user) {
        req.flash('error', 'Please request a new password reset link.');
        return res.redirect('/reset');
      } else {
        return bcrypt
          .hash(password, 12)
          .then(hashedPassword => {
            user.password = hashedPassword;
            user.resetToken = undefined;
            user.resetTokenExpiration = undefined;
            user.save().then(_result => {
              res.redirect('/login');
              return transporter
                .sendMail({
                  to: user.email,
                  from: 'shop@node-complete.com',
                  subject: 'Password was reset',
                  html: `<p>You're account password has been reset successfully</p>`,
                })
                .catch(err => console.log(err));
            });
          })
          .then(_result => {});
      }
    })
    .catch(err => console.log(err));
};
