const { expect } = require('chai');
const mongoose = require('mongoose');
const UserResponseFactory = require('../factories/userResponseFactory');

describe('UserResponseFactory', () => {

  describe('auth type', () => {
    it('returns a correctly shaped auth response with token', () => {
      const user = { id: 'abc123', name: 'Lance', email: 'lance@test.com', isAdmin: false };
      const result = UserResponseFactory.create('auth', user, 'mytoken');
      expect(result).to.deep.equal({
        id: 'abc123',
        name: 'Lance',
        email: 'lance@test.com',
        isAdmin: false,
        token: 'mytoken',
      });
    });

    it('casts isAdmin to boolean for auth response', () => {
      const user = { id: 'abc123', name: 'Lance', email: 'lance@test.com', isAdmin: undefined };
      const result = UserResponseFactory.create('auth', user, 'mytoken');
      expect(result.isAdmin).to.equal(false);
    });
  });

  describe('admin type', () => {
    it('returns a correctly shaped admin response without token', () => {
      const id = new mongoose.Types.ObjectId();
      const user = { _id: id, name: 'Lance', email: 'lance@test.com', isAdmin: true, status: 'active' };
      const result = UserResponseFactory.create('admin', user);
      expect(result).to.deep.equal({
        id,
        name: 'Lance',
        email: 'lance@test.com',
        isAdmin: true,
        status: 'active',
      });
    });

    it('casts isAdmin to boolean for admin response', () => {
      const id = new mongoose.Types.ObjectId();
      const user = { _id: id, name: 'Lance', email: 'lance@test.com', isAdmin: undefined, status: 'active' };
      const result = UserResponseFactory.create('admin', user);
      expect(result.isAdmin).to.equal(false);
    });
  });

  describe('unknown type', () => {
    it('throws an error for an unrecognised type', () => {
      const user = { id: 'abc123', name: 'Lance', email: 'lance@test.com' };
      expect(() => UserResponseFactory.create('unknown', user)).to.throw('UserResponseFactory: unknown type "unknown"');
    });
  });

});
