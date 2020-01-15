const expect = require('chai').expect;
const sinon = require('sinon');

const authController = require('../controllers/auth');
const User = require('../models/user');

describe('auth controller - login', () => {
  it('should throw error if accessing database fails', done => {
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test@test.com',
        password: 'test',
      },
    };
    authController
      .login(req, {}, () => {})
      .then(result => {
        expect(result).to.be.an('error');
        expect(result).to.have.property('statusCode', 500);
        done();
      });
    User.findOne.restore();
  });
});
