require('dotenv').config(); // allows access to .env vars
const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const statusController = require('../controllers/status');
const User = require('../models/user');

describe('status controller - login', () => {
  let _userId;

  // hooks that run once per describe
  before(done => {
    mongoose
      .connect(process.env.MONGODB_TEST_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(client => {
        const user = new User({
          email: 'test@test.com',
          password: 'test',
          name: 'Tester',
          posts: [],
        });
        return user.save();
      })
      .then(user => {
        userId = user._id.toString();
        done();
      });
  });

  after(done => {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });

  // hooks that run for each test
  beforeEach(() => {});
  afterEach(() => {});

  it('should send a response with a valid status for an existing user', done => {
    const req = {
      userId,
    };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.userStatus = data.status;
      },
    };
    statusController
      .getStatus(req, res, () => {})
      .then(() => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.userStatus).to.be.equal('I am new!');
        done();
      });
  });
});
