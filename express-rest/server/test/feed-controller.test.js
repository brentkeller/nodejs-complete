require('dotenv').config(); // allows access to .env vars
const expect = require('chai').expect;
const mongoose = require('mongoose');

const feedController = require('../controllers/feed');
const User = require('../models/user');

describe('Feed controller', () => {
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

  it('should add a created post to user post list', done => {
    const req = {
      body: {
        title: 'Test Post',
        content: 'Lots of great stuff',
      },
      file: {
        path: 'foo',
      },
      userId,
    };
    const res = {
      statusCode: 500,
      resData: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.resData = data;
      },
    };
    feedController
      .postPost(req, res, () => {})
      .then(savedUser => {
        expect(res.statusCode).to.be.equal(201);
        expect(res.resData).to.have.property('message', 'Post created');
        expect(res.resData).to.have.property('post');
        expect(res.resData).to.have.property('creator');
        expect(savedUser.posts).to.have.lengthOf(1);
        done();
      });
  });
});
