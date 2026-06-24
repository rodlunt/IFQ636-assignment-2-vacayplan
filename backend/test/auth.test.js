const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

    describe('GET /api/auth/profile', () => {
        let userId;
        let token;

        beforeEach(() => {
            userId = new mongoose.Types.ObjectId();
            token = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });
        });

        // protect (Chain of Responsibility) calls User.findById(id).select('-password');
        // getProfile then calls User.findById(req.user.id) directly. The first call
        // feeds the middleware, the second feeds the handler.
        const stubAuthThen = (handlerResult) => {
            const findById = sinon.stub(User, 'findById');
            findById.onFirstCall().returns({
                select: sinon.stub().resolves({ id: userId.toString() }),
            });
            if (handlerResult instanceof Error) {
                findById.onSecondCall().rejects(handlerResult);
            } else {
                findById.onSecondCall().resolves(handlerResult);
            }
            return findById;
        };

        it('returns 200 with the profile fields for an authenticated user', async () => {
            stubAuthThen({
                name: 'Profile User',
                email: 'profile@test.com',
                university: 'QUT',
                address: '2 George St',
            });

            const res = await chai.request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal({
                name: 'Profile User',
                email: 'profile@test.com',
                university: 'QUT',
                address: '2 George St',
            });
        });

        it('returns 404 when the user no longer exists', async () => {
            stubAuthThen(null);

            const res = await chai.request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'User not found');
        });

        it('returns 401 when no token is provided', async () => {
            const res = await chai.request(app).get('/api/auth/profile');
            expect(res).to.have.status(401);
        });

        it('returns 500 when the profile lookup throws', async () => {
            stubAuthThen(new Error('db down'));

            const res = await chai.request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(500);
            expect(res.body).to.have.property('message', 'Server error');
        });
    });

    describe('PUT /api/auth/profile', () => {
        let userId;
        let token;

        beforeEach(() => {
            userId = new mongoose.Types.ObjectId();
            token = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });
        });

        const stubAuthThen = (handlerResult) => {
            const findById = sinon.stub(User, 'findById');
            findById.onFirstCall().returns({
                select: sinon.stub().resolves({ id: userId.toString() }),
            });
            findById.onSecondCall().resolves(handlerResult);
            return findById;
        };

        it('updates the provided fields and returns 200 with a token', async () => {
            const userDoc = {
                id: userId.toString(),
                name: 'Old Name',
                email: 'old@test.com',
                university: 'UQ',
                address: 'Old Address',
                save: sinon.stub().resolvesThis(),
            };
            stubAuthThen(userDoc);

            const res = await chai.request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'New Name', email: 'new@test.com', address: 'New Address' });

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('name', 'New Name');
            expect(res.body).to.have.property('email', 'new@test.com');
            expect(res.body).to.have.property('token').that.is.a('string');
            expect(userDoc.save.calledOnce).to.be.true;
            expect(userDoc.university).to.equal('UQ'); // omitted field retained
        });

        it('keeps existing values for fields that are not provided', async () => {
            const userDoc = {
                id: userId.toString(),
                name: 'Keep Name',
                email: 'keep@test.com',
                university: 'QUT',
                address: 'Keep Address',
                save: sinon.stub().resolvesThis(),
            };
            stubAuthThen(userDoc);

            const res = await chai.request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({ university: 'New University' });

            expect(res).to.have.status(200);
            expect(userDoc.university).to.equal('New University');
            expect(userDoc.name).to.equal('Keep Name');
            expect(userDoc.email).to.equal('keep@test.com');
            expect(userDoc.address).to.equal('Keep Address');
        });

        it('returns 404 when the user no longer exists', async () => {
            stubAuthThen(null);

            const res = await chai.request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'X' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'User not found');
        });

        it('returns 500 when save throws', async () => {
            const userDoc = {
                id: userId.toString(),
                name: 'N',
                email: 'e@test.com',
                university: 'U',
                address: 'A',
                save: sinon.stub().rejects(new Error('save failed')),
            };
            stubAuthThen(userDoc);

            const res = await chai.request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'X' });

            expect(res).to.have.status(500);
            expect(res.body).to.have.property('message', 'save failed');
        });
    });
});
