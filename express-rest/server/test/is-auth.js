const expect = require('chai').expect;
const authMiddleware = require('../middleware/is-auth');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

describe('is-auth', () => {
  it('should throw error if no authorization header is present', () => {
    const req = {
      get: () => null,
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      'Not authenticated',
    );
  });

  it('should throw error if no authorization header is only one string', () => {
    const req = {
      get: headerName => 'xyz',
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      'jwt must be provided',
    );
  });

  it('should throw error if token cennot be verified', () => {
    const req = {
      get: headerName => 'Bearer xyz',
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should add userId to req', () => {
    const req = {
      get: headerName => 'Bearer xyz',
    };
    sinon.stub(jwt, 'verify');
    jwt.verify.returns({ userId: 'abc' });
    authMiddleware(req, {}, () => {});
    expect(req).to.have.property('userId', 'abc');
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore();
  });
});
