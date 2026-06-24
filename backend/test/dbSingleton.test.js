const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
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

  describe('connectDB wrapper', () => {
    let logStub;
    let errStub;
    let exitStub;

    beforeEach(() => {
      logStub = sinon.stub(console, 'log');
      errStub = sinon.stub(console, 'error');
      exitStub = sinon.stub(process, 'exit');
    });

    it('connects via the singleton and logs success', async () => {
      await connectDB();
      expect(connectStub.calledOnce).to.equal(true);
      expect(logStub.calledWithMatch('MongoDB connected successfully')).to.equal(true);
      expect(exitStub.called).to.equal(false);
    });

    it('logs the error and exits the process when the connection fails', async () => {
      connectStub.restore();
      sinon.stub(mongoose, 'connect').rejects(new Error('no db'));

      await connectDB();

      expect(errStub.calledWithMatch('MongoDB connection error:')).to.equal(true);
      expect(exitStub.calledWith(1)).to.equal(true);
    });
  });
});
