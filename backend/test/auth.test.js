const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('../models/User');
const app = require('../server');

chai.use(chaiHttp);
const { expect } = chai;

describe('Auth Controller (/api/auth)', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('POST /api/auth/register', () => {
        it('registers a new user and returns 201 with a token', async () => {
            const userId = new mongoose.Types.ObjectId();
            sinon.stub(User, 'findOne').resolves(null);
            sinon.stub(User, 'create').resolves({
                id: userId.toString(),
                name: 'Test User',
                email: 'test@test.com',
            });

            const res = await chai.request(app)
                .post('/api/auth/register')
                .send({ name: 'Test User', email: 'test@test.com', password: 'pw12345' });

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('email', 'test@test.com');
            expect(res.body).to.have.property('token').that.is.a('string');
            expect(User.create.calledOnce).to.be.true;
        });

        it('returns 409 when the email already exists', async () => {
            sinon.stub(User, 'findOne').resolves({ id: 'existing', email: 'test@test.com' });
            const createSpy = sinon.spy(User, 'create');

            const res = await chai.request(app)
                .post('/api/auth/register')
                .send({ name: 'Test User', email: 'test@test.com', password: 'pw12345' });

            expect(res).to.have.status(409);
            expect(res.body).to.have.property('message', 'Email already registered');
            expect(createSpy.notCalled).to.be.true;
        });

        it('returns 400 when name, email, or password is missing', async () => {
            const findSpy = sinon.spy(User, 'findOne');

            const missingName = await chai.request(app)
                .post('/api/auth/register')
                .send({ email: 'test@test.com', password: 'pw12345' });
            expect(missingName).to.have.status(400);

            const missingEmail = await chai.request(app)
                .post('/api/auth/register')
                .send({ name: 'Test User', password: 'pw12345' });
            expect(missingEmail).to.have.status(400);

            const missingPassword = await chai.request(app)
                .post('/api/auth/register')
                .send({ name: 'Test User', email: 'test@test.com' });
            expect(missingPassword).to.have.status(400);

            expect(missingPassword.body).to.have.property('message', 'Name, email, and password are required');
            expect(findSpy.notCalled).to.be.true;
        });

        it('returns 500 when User.findOne throws', async () => {
            sinon.stub(User, 'findOne').rejects(new Error('db down'));

            const res = await chai.request(app)
                .post('/api/auth/register')
                .send({ name: 'Test User', email: 'test@test.com', password: 'pw12345' });

            expect(res).to.have.status(500);
            expect(res.body).to.have.property('message', 'db down');
        });
    });

    describe('POST /api/auth/login', () => {
        it('returns 200 with a token when credentials are valid', async () => {
            const userId = new mongoose.Types.ObjectId();
            sinon.stub(User, 'findOne').resolves({
                id: userId.toString(),
                name: 'Test User',
                email: 'test@test.com',
                password: 'hashed-pw',
            });
            sinon.stub(bcrypt, 'compare').resolves(true);

            const res = await chai.request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com', password: 'pw12345' });

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('email', 'test@test.com');
            expect(res.body).to.have.property('token').that.is.a('string');
        });

        it('returns 401 when the password is wrong', async () => {
            sinon.stub(User, 'findOne').resolves({
                id: 'someid',
                email: 'test@test.com',
                password: 'hashed-pw',
            });
            sinon.stub(bcrypt, 'compare').resolves(false);

            const res = await chai.request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com', password: 'wrong' });

            expect(res).to.have.status(401);
            expect(res.body).to.have.property('message', 'Invalid email or password');
        });

        it('returns 401 when the user does not exist', async () => {
            sinon.stub(User, 'findOne').resolves(null);
            const compareSpy = sinon.spy(bcrypt, 'compare');

            const res = await chai.request(app)
                .post('/api/auth/login')
                .send({ email: 'missing@test.com', password: 'pw12345' });

            expect(res).to.have.status(401);
            expect(res.body).to.have.property('message', 'Invalid email or password');
            expect(compareSpy.notCalled).to.be.true;
        });

        it('returns 500 when User.findOne throws', async () => {
            sinon.stub(User, 'findOne').rejects(new Error('db down'));

            const res = await chai.request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com', password: 'pw12345' });

            expect(res).to.have.status(500);
            expect(res.body).to.have.property('message', 'db down');
        });

        it('returns 403 when the user is deactivated even with correct credentials (VP-82)', async () => {
            sinon.stub(User, 'findOne').resolves({
                id: 'someid',
                name: 'Deactivated User',
                email: 'test@test.com',
                password: 'hashed-pw',
                status: 'deactivated',
            });
            sinon.stub(bcrypt, 'compare').resolves(true);

            const res = await chai.request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com', password: 'pw12345' });

            expect(res).to.have.status(403);
            expect(res.body).to.have.property('message', 'Account is deactivated');
        });
    });
});
