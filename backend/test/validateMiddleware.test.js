const { expect } = require('chai');
const sinon = require('sinon');
const { validate, requireUserFields, requireValidStatus } = require('../middleware/validateMiddleware');

// Minimal res double: records status/json calls the way Express would receive them.
const makeRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

describe('validate middleware (Chain of Responsibility link)', () => {

  describe('chain behaviour', () => {
    it('passes the request to the next link when every rule passes', () => {
      const req = { body: { name: 'A', email: 'a@test.com', password: 'pw' } };
      const res = makeRes();
      const next = sinon.spy();

      validate([requireUserFields])(req, res, next);

      expect(next.calledOnce).to.equal(true);
      expect(res.status.called).to.equal(false);
    });

    it('handles the request with 400 and stops the chain on the first failing rule', () => {
      const req = { body: { name: 'A' } };
      const res = makeRes();
      const next = sinon.spy();

      validate([requireUserFields])(req, res, next);

      expect(next.called).to.equal(false);
      expect(res.status.calledOnceWith(400)).to.equal(true);
      expect(res.json.calledOnceWith({ message: 'Name, email, and password are required' })).to.equal(true);
    });
  });

  describe('rules', () => {
    it('requireUserFields rejects when any of name/email/password is missing', () => {
      expect(requireUserFields({ body: { email: 'a@test.com', password: 'pw' } })).to.be.a('string');
      expect(requireUserFields({ body: { name: 'A', password: 'pw' } })).to.be.a('string');
      expect(requireUserFields({ body: { name: 'A', email: 'a@test.com' } })).to.be.a('string');
      expect(requireUserFields({ body: { name: 'A', email: 'a@test.com', password: 'pw' } })).to.equal(null);
    });

    it('requireValidStatus only accepts active or deactivated', () => {
      expect(requireValidStatus({ body: { status: 'active' } })).to.equal(null);
      expect(requireValidStatus({ body: { status: 'deactivated' } })).to.equal(null);
      expect(requireValidStatus({ body: { status: 'suspended' } })).to.be.a('string');
      expect(requireValidStatus({ body: {} })).to.be.a('string');
    });
  });
});
