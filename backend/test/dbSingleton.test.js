const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { Database } = require('../config/db');

describe('Database singleton (config/db.js)', () => {
  let connectStub;

  beforeEach(() => {
    // Reset the singleton between tests so each test exercises the
    // guard from a clean state.
    Database.instance = null;
    connectStub = sinon.stub(mongoose, 'connect').resolves(mongoose);
  });

  afterEach(() => {
    sinon.restore();
    Database.instance = null;
  });

  describe('getInstance', () => {
    it('returns the same instance on every call', () => {
      const first = Database.getInstance();
      const second = Database.getInstance();
      expect(first).to.equal(second);
    });

    it('refuses direct construction once the instance exists', () => {
      Database.getInstance();
      expect(() => new Database()).to.throw('Database is a singleton');
    });
  });

  describe('connect re-initialisation guard', () => {
    it('only ever opens one Mongoose connection across repeat calls', async () => {
      const db = Database.getInstance();
      const first = db.connect();
      const second = db.connect();
      await Promise.all([first, second]);

      expect(first).to.equal(second);
      expect(connectStub.calledOnce).to.equal(true);
    });

    it('reuses the established connection on a later connect call', async () => {
      const db = Database.getInstance();
      await db.connect();
      await db.connect();
      expect(connectStub.calledOnce).to.equal(true);
    });
  });
});
