const chai = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');

const User = require('../models/User');

const { expect } = chai;

const preSaveHooks = User.schema.s.hooks._pres.get('save');
const bcryptPreSaveHook = preSaveHooks.find((h) => h.fn.toString().includes('bcrypt')).fn;

const runBcryptHook = (doc) =>
    new Promise((resolve, reject) => {
        const next = (err) => (err ? reject(err) : resolve());
        const result = bcryptPreSaveHook.call(doc, next);
        if (result && typeof result.then === 'function') {
            result.then(() => resolve(), reject);
        }
    });

describe('User model — password pre-save hook (VP-48)', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('hashes the password via bcrypt before save', async () => {
        const user = new User({
            name: 'VP-48 A',
            email: 'vp48a@test.com',
            password: 'plain123',
        });
        await runBcryptHook(user);

        expect(user.password).to.not.equal('plain123');
        expect(user.password).to.match(/^\$2[aby]\$\d{2}\$/);
    });

    it('produces a hash that verifies against the plaintext', async () => {
        const user = new User({
            name: 'VP-48 B',
            email: 'vp48b@test.com',
            password: 'roundtrip-pw',
        });
        await runBcryptHook(user);

        const matches = await bcrypt.compare('roundtrip-pw', user.password);
        expect(matches).to.be.true;
    });

    it('skips hashing when isModified(password) is false', async () => {
        const preHashed = '$2b$10$abcdefghijklmnopqrstuvwxyz0123456789012345678901234';
        const user = new User({
            name: 'VP-48 C',
            email: 'vp48c@test.com',
            password: preHashed,
        });

        const realIsModified = user.isModified.bind(user);
        sinon.stub(user, 'isModified').callsFake((field) => {
            if (field === 'password') return false;
            return realIsModified(field);
        });

        await runBcryptHook(user);

        expect(user.password).to.equal(preHashed);
    });
});
