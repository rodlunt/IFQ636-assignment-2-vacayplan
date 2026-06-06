const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../models/User');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');
const app = require('../server');

chai.use(chaiHttp);
const { expect } = chai;

const tokenFor = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Admin Controller (/api/admin)', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('POST /api/admin/users (VP-110/111/112)', () => {
        const stubAdminAuth = (adminId) => {
            const findByIdStub = sinon.stub(User, 'findById');
            findByIdStub.onFirstCall().callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: adminId,
                    name: 'Admin',
                    email: 'admin@vacayplan.com',
                    isAdmin: true,
                }),
            }));
            return findByIdStub;
        };

        it('returns 201 with the created user (no password) when isAdmin omitted (defaults false)', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            const newId = new mongoose.Types.ObjectId().toString();
            stubAdminAuth(adminId);
            sinon.stub(User, 'findOne').resolves(null);
            sinon.stub(User, 'create').resolves({
                _id: newId,
                name: 'Newbie',
                email: 'newbie@test.com',
                isAdmin: false,
                status: 'active',
            });

            const res = await chai.request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${tokenFor(adminId)}`)
                .send({ name: 'Newbie', email: 'newbie@test.com', password: 'secret123' });

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('email', 'newbie@test.com');
            expect(res.body).to.have.property('isAdmin', false);
            expect(res.body).to.have.property('status', 'active');
            expect(res.body).to.not.have.property('password');
        });

        it('returns 201 with isAdmin=true when admin flag passed', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            const newId = new mongoose.Types.ObjectId().toString();
            stubAdminAuth(adminId);
            sinon.stub(User, 'findOne').resolves(null);
            const createStub = sinon.stub(User, 'create').resolves({
                _id: newId,
                name: 'New Admin',
                email: 'newadmin@test.com',
                isAdmin: true,
                status: 'active',
            });

            const res = await chai.request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${tokenFor(adminId)}`)
                .send({ name: 'New Admin', email: 'newadmin@test.com', password: 'secret123', isAdmin: true });

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('isAdmin', true);
            expect(createStub.calledOnce).to.be.true;
            expect(createStub.firstCall.args[0]).to.include({ isAdmin: true });
        });

        it('returns 400 when required fields are missing', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            stubAdminAuth(adminId);
            const findOneSpy = sinon.spy(User, 'findOne');
            const createSpy = sinon.spy(User, 'create');

            const res = await chai.request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${tokenFor(adminId)}`)
                .send({ email: 'incomplete@test.com' });

            expect(res).to.have.status(400);
            expect(res.body.message).to.match(/required/i);
            expect(findOneSpy.notCalled).to.be.true;
            expect(createSpy.notCalled).to.be.true;
        });

        it('returns 409 when the email is already registered', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            stubAdminAuth(adminId);
            sinon.stub(User, 'findOne').resolves({ _id: 'existing', email: 'taken@test.com' });
            const createSpy = sinon.spy(User, 'create');

            const res = await chai.request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${tokenFor(adminId)}`)
                .send({ name: 'Dup', email: 'taken@test.com', password: 'secret123' });

            expect(res).to.have.status(409);
            expect(res.body).to.have.property('message', 'Email already registered');
            expect(createSpy.notCalled).to.be.true;
        });

        it('returns 403 when the authenticated user is not an admin', async () => {
            const userId = new mongoose.Types.ObjectId().toString();
            sinon.stub(User, 'findById').callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: userId,
                    name: 'Regular',
                    email: 'user@test.com',
                    isAdmin: false,
                }),
            }));
            const createSpy = sinon.spy(User, 'create');

            const res = await chai.request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${tokenFor(userId)}`)
                .send({ name: 'Whatever', email: 'whatever@test.com', password: 'secret123' });

            expect(res).to.have.status(403);
            expect(createSpy.notCalled).to.be.true;
        });

        it('returns 401 when no token is provided', async () => {
            const createSpy = sinon.spy(User, 'create');

            const res = await chai.request(app)
                .post('/api/admin/users')
                .send({ name: 'Whatever', email: 'whatever@test.com', password: 'secret123' });

            expect(res).to.have.status(401);
            expect(createSpy.notCalled).to.be.true;
        });
    });

    describe('GET /api/admin/users', () => {
        it('returns 200 with all users (no password) sorted by createdAt desc for an admin', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();

            sinon.stub(User, 'findById').callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: adminId,
                    name: 'Admin User',
                    email: 'admin@vacayplan.com',
                    isAdmin: true,
                }),
            }));

            const users = [
                { _id: 'u1', name: 'User One', email: 'u1@test.com', isAdmin: false, createdAt: new Date('2026-05-25') },
                { _id: 'u2', name: 'User Two', email: 'u2@test.com', isAdmin: false, createdAt: new Date('2026-05-24') },
            ];
            sinon.stub(User, 'find').callsFake(() => ({
                select: sinon.stub().returns({
                    sort: sinon.stub().resolves(users),
                }),
            }));

            const res = await chai.request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${tokenFor(adminId)}`);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array').with.lengthOf(2);
            expect(res.body[0]).to.have.property('email', 'u1@test.com');
            expect(res.body[0]).to.not.have.property('password');
            expect(User.find.calledOnce).to.be.true;
        });

        it('returns 403 when the authenticated user is not an admin', async () => {
            const userId = new mongoose.Types.ObjectId().toString();

            sinon.stub(User, 'findById').callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: userId,
                    name: 'Regular User',
                    email: 'user@vacayplan.com',
                    isAdmin: false,
                }),
            }));
            const findSpy = sinon.spy(User, 'find');

            const res = await chai.request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${tokenFor(userId)}`);

            expect(res).to.have.status(403);
            expect(res.body).to.have.property('message', 'Admin access required');
            expect(findSpy.notCalled).to.be.true;
        });

        it('returns 401 when no token is provided', async () => {
            const findSpy = sinon.spy(User, 'find');

            const res = await chai.request(app).get('/api/admin/users');

            expect(res).to.have.status(401);
            expect(findSpy.notCalled).to.be.true;
        });

        it('returns 500 when User.find throws', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();

            sinon.stub(User, 'findById').callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: adminId,
                    name: 'Admin',
                    email: 'admin@vacayplan.com',
                    isAdmin: true,
                }),
            }));
            sinon.stub(User, 'find').callsFake(() => ({
                select: sinon.stub().returns({
                    sort: sinon.stub().rejects(new Error('db down')),
                }),
            }));

            const res = await chai.request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${tokenFor(adminId)}`);

            expect(res).to.have.status(500);
            expect(res.body).to.have.property('message', 'db down');
        });
    });

    describe('GET /api/admin/users/:id', () => {
        const stubAuthAsAdmin = (adminId) => {
            sinon.stub(User, 'findById')
                .onFirstCall().callsFake(() => ({
                    select: sinon.stub().resolves({
                        _id: adminId,
                        name: 'Admin',
                        email: 'admin@vacayplan.com',
                        isAdmin: true,
                    }),
                }));
        };

        it('returns the user (no password) plus their trips sorted by startDate desc for an admin', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            const targetId = new mongoose.Types.ObjectId().toString();
            const targetUser = {
                _id: targetId,
                name: 'Target User',
                email: 'target@test.com',
                isAdmin: false,
                toObject() {
                    return { _id: targetId, name: this.name, email: this.email, isAdmin: this.isAdmin };
                },
            };
            const trips = [
                { _id: 't1', userId: targetId, destination: 'Sydney', startDate: '2026-07-01' },
                { _id: 't2', userId: targetId, destination: 'Melbourne', startDate: '2026-06-01' },
            ];

            const findByIdStub = sinon.stub(User, 'findById');
            findByIdStub.onFirstCall().callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: adminId,
                    name: 'Admin',
                    email: 'admin@vacayplan.com',
                    isAdmin: true,
                }),
            }));
            findByIdStub.onSecondCall().callsFake(() => ({
                select: sinon.stub().resolves(targetUser),
            }));
            sinon.stub(Trip, 'find').callsFake(() => ({
                sort: sinon.stub().resolves(trips),
            }));

            const res = await chai.request(app)
                .get(`/api/admin/users/${targetId}`)
                .set('Authorization', `Bearer ${tokenFor(adminId)}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('email', 'target@test.com');
            expect(res.body).to.not.have.property('password');
            expect(res.body).to.have.property('trips').that.is.an('array').with.lengthOf(2);
            expect(res.body.trips[0]).to.have.property('destination', 'Sydney');
        });

        it('returns 404 when the user does not exist', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            const missingId = new mongoose.Types.ObjectId().toString();

            const findByIdStub = sinon.stub(User, 'findById');
            findByIdStub.onFirstCall().callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: adminId,
                    name: 'Admin',
                    email: 'admin@vacayplan.com',
                    isAdmin: true,
                }),
            }));
            findByIdStub.onSecondCall().callsFake(() => ({
                select: sinon.stub().resolves(null),
            }));
            const tripFindSpy = sinon.spy(Trip, 'find');

            const res = await chai.request(app)
                .get(`/api/admin/users/${missingId}`)
                .set('Authorization', `Bearer ${tokenFor(adminId)}`);

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'User not found');
            expect(tripFindSpy.notCalled).to.be.true;
        });

        it('returns 403 when the authenticated user is not an admin', async () => {
            const userId = new mongoose.Types.ObjectId().toString();
            const targetId = new mongoose.Types.ObjectId().toString();

            sinon.stub(User, 'findById').callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: userId,
                    name: 'Regular User',
                    email: 'user@test.com',
                    isAdmin: false,
                }),
            }));
            const tripFindSpy = sinon.spy(Trip, 'find');

            const res = await chai.request(app)
                .get(`/api/admin/users/${targetId}`)
                .set('Authorization', `Bearer ${tokenFor(userId)}`);

            expect(res).to.have.status(403);
            expect(tripFindSpy.notCalled).to.be.true;
        });

        it('returns 401 when no token is provided', async () => {
            const targetId = new mongoose.Types.ObjectId().toString();
            const res = await chai.request(app).get(`/api/admin/users/${targetId}`);
            expect(res).to.have.status(401);
        });
    });

    describe('PATCH /api/admin/users/:id (deactivate path)', () => {
        const stubAdminAuth = (adminId) => {
            const findByIdStub = sinon.stub(User, 'findById');
            findByIdStub.onFirstCall().callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: adminId,
                    name: 'Admin',
                    email: 'admin@vacayplan.com',
                    isAdmin: true,
                }),
            }));
            return findByIdStub;
        };

        it('deactivates an active user and returns the updated record', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            const targetId = new mongoose.Types.ObjectId().toString();
            const targetUser = {
                _id: targetId,
                name: 'Target',
                email: 'target@test.com',
                isAdmin: false,
                status: 'active',
                save: sinon.stub().resolvesThis(),
            };
            const findByIdStub = stubAdminAuth(adminId);
            findByIdStub.onSecondCall().resolves(targetUser);

            const res = await chai.request(app)
                .patch(`/api/admin/users/${targetId}`)
                .set('Authorization', `Bearer ${tokenFor(adminId)}`)
                .send({ status: 'deactivated' });

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('status', 'deactivated');
            expect(res.body).to.not.have.property('password');
            expect(targetUser.save.calledOnce).to.be.true;
        });

        it('is idempotent when the user is already deactivated', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            const targetId = new mongoose.Types.ObjectId().toString();
            const targetUser = {
                _id: targetId,
                name: 'Target',
                email: 'target@test.com',
                isAdmin: false,
                status: 'deactivated',
                save: sinon.stub().resolvesThis(),
            };
            const findByIdStub = stubAdminAuth(adminId);
            findByIdStub.onSecondCall().resolves(targetUser);

            const res = await chai.request(app)
                .patch(`/api/admin/users/${targetId}`)
                .set('Authorization', `Bearer ${tokenFor(adminId)}`)
                .send({ status: 'deactivated' });

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('status', 'deactivated');
        });

        it('returns 400 when the status body is missing or invalid', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            const targetId = new mongoose.Types.ObjectId().toString();
            stubAdminAuth(adminId);

            const res = await chai.request(app)
                .patch(`/api/admin/users/${targetId}`)
                .set('Authorization', `Bearer ${tokenFor(adminId)}`)
                .send({ status: 'invalid-state' });

            expect(res).to.have.status(400);
            expect(res.body.message).to.match(/deactivated/);
        });

        it('returns 404 when the target user does not exist', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            const missingId = new mongoose.Types.ObjectId().toString();
            const findByIdStub = stubAdminAuth(adminId);
            findByIdStub.onSecondCall().resolves(null);

            const res = await chai.request(app)
                .patch(`/api/admin/users/${missingId}`)
                .set('Authorization', `Bearer ${tokenFor(adminId)}`)
                .send({ status: 'deactivated' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'User not found');
        });

        it('returns 403 when the authenticated user is not an admin', async () => {
            const userId = new mongoose.Types.ObjectId().toString();
            const targetId = new mongoose.Types.ObjectId().toString();
            sinon.stub(User, 'findById').callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: userId,
                    name: 'Regular',
                    email: 'user@test.com',
                    isAdmin: false,
                }),
            }));

            const res = await chai.request(app)
                .patch(`/api/admin/users/${targetId}`)
                .set('Authorization', `Bearer ${tokenFor(userId)}`)
                .send({ status: 'deactivated' });

            expect(res).to.have.status(403);
        });
    });

    describe('PATCH /api/admin/users/:id (reactivate path, VP-85)', () => {
        const stubAdminAuth = (adminId) => {
            const findByIdStub = sinon.stub(User, 'findById');
            findByIdStub.onFirstCall().callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: adminId,
                    name: 'Admin',
                    email: 'admin@vacayplan.com',
                    isAdmin: true,
                }),
            }));
            return findByIdStub;
        };

        it('reactivates a deactivated user and returns the updated record', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            const targetId = new mongoose.Types.ObjectId().toString();
            const targetUser = {
                _id: targetId,
                name: 'Target',
                email: 'target@test.com',
                isAdmin: false,
                status: 'deactivated',
                save: sinon.stub().resolvesThis(),
            };
            const findByIdStub = stubAdminAuth(adminId);
            findByIdStub.onSecondCall().resolves(targetUser);

            const res = await chai.request(app)
                .patch(`/api/admin/users/${targetId}`)
                .set('Authorization', `Bearer ${tokenFor(adminId)}`)
                .send({ status: 'active' });

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('status', 'active');
            expect(targetUser.save.calledOnce).to.be.true;
        });

        it('rejects reactivating an already-active user with 400', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            const targetId = new mongoose.Types.ObjectId().toString();
            const targetUser = {
                _id: targetId,
                name: 'Target',
                email: 'target@test.com',
                isAdmin: false,
                status: 'active',
                save: sinon.stub().resolvesThis(),
            };
            const findByIdStub = stubAdminAuth(adminId);
            findByIdStub.onSecondCall().resolves(targetUser);

            const res = await chai.request(app)
                .patch(`/api/admin/users/${targetId}`)
                .set('Authorization', `Bearer ${tokenFor(adminId)}`)
                .send({ status: 'active' });

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('message', 'User is already active');
            expect(targetUser.save.notCalled).to.be.true;
        });
    });

    describe('DELETE /api/admin/users/:id (cascade, VP-88)', () => {
        const stubAdminAuth = (adminId) => {
            const findByIdStub = sinon.stub(User, 'findById');
            findByIdStub.onFirstCall().callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: adminId,
                    name: 'Admin',
                    email: 'admin@vacayplan.com',
                    isAdmin: true,
                }),
            }));
            return findByIdStub;
        };

        it('cascade-deletes the user, their trips, and all activities under those trips', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            const targetId = new mongoose.Types.ObjectId().toString();
            const targetUser = {
                _id: targetId,
                name: 'Target',
                email: 'target@test.com',
                deleteOne: sinon.stub().resolves(),
            };
            const trips = [{ _id: 't1' }, { _id: 't2' }];

            const findByIdStub = stubAdminAuth(adminId);
            findByIdStub.onSecondCall().resolves(targetUser);
            const tripFindStub = sinon.stub(Trip, 'find').returns({
                select: sinon.stub().resolves(trips),
            });
            const activityDeleteStub = sinon.stub(Activity, 'deleteMany').resolves();
            const tripDeleteStub = sinon.stub(Trip, 'deleteMany').resolves();

            const res = await chai.request(app)
                .delete(`/api/admin/users/${targetId}`)
                .set('Authorization', `Bearer ${tokenFor(adminId)}`);

            expect(res).to.have.status(204);
            expect(tripFindStub.calledOnceWith({ userId: targetUser._id })).to.be.true;
            expect(activityDeleteStub.calledOnceWith({ tripId: { $in: ['t1', 't2'] } })).to.be.true;
            expect(tripDeleteStub.calledOnceWith({ userId: targetUser._id })).to.be.true;
            expect(targetUser.deleteOne.calledOnce).to.be.true;
        });

        it('logs an [AUDIT] line capturing both user and admin identities on successful delete (VP-19 AC)', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            const targetId = new mongoose.Types.ObjectId().toString();
            const targetUser = {
                _id: targetId,
                name: 'Target',
                email: 'target@test.com',
                deleteOne: sinon.stub().resolves(),
            };

            const findByIdStub = stubAdminAuth(adminId);
            findByIdStub.onSecondCall().resolves(targetUser);
            sinon.stub(Trip, 'find').returns({ select: sinon.stub().resolves([]) });
            sinon.stub(Activity, 'deleteMany').resolves();
            sinon.stub(Trip, 'deleteMany').resolves();
            const logStub = sinon.stub(console, 'log');

            const res = await chai.request(app)
                .delete(`/api/admin/users/${targetId}`)
                .set('Authorization', `Bearer ${tokenFor(adminId)}`);

            expect(res).to.have.status(204);
            expect(logStub.calledOnce).to.be.true;
            const logCall = logStub.firstCall.args[0];
            expect(logCall).to.match(/\[AUDIT\]/);
            expect(logCall).to.include('target@test.com');
            expect(logCall).to.include(targetId);
            expect(logCall).to.include('admin@vacayplan.com');
            expect(logCall).to.include(adminId);
        });

        it('returns 404 when the target user does not exist (no cascade attempted)', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();
            const missingId = new mongoose.Types.ObjectId().toString();
            const findByIdStub = stubAdminAuth(adminId);
            findByIdStub.onSecondCall().resolves(null);
            const tripFindSpy = sinon.spy(Trip, 'find');
            const activityDeleteSpy = sinon.spy(Activity, 'deleteMany');
            const tripDeleteSpy = sinon.spy(Trip, 'deleteMany');

            const res = await chai.request(app)
                .delete(`/api/admin/users/${missingId}`)
                .set('Authorization', `Bearer ${tokenFor(adminId)}`);

            expect(res).to.have.status(404);
            expect(tripFindSpy.notCalled).to.be.true;
            expect(activityDeleteSpy.notCalled).to.be.true;
            expect(tripDeleteSpy.notCalled).to.be.true;
        });

        it('returns 403 when the authenticated user is not an admin', async () => {
            const userId = new mongoose.Types.ObjectId().toString();
            const targetId = new mongoose.Types.ObjectId().toString();
            sinon.stub(User, 'findById').callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: userId,
                    name: 'Regular',
                    email: 'user@test.com',
                    isAdmin: false,
                }),
            }));
            const tripFindSpy = sinon.spy(Trip, 'find');

            const res = await chai.request(app)
                .delete(`/api/admin/users/${targetId}`)
                .set('Authorization', `Bearer ${tokenFor(userId)}`);

            expect(res).to.have.status(403);
            expect(tripFindSpy.notCalled).to.be.true;
        });

        it('returns 401 when no token is provided', async () => {
            const targetId = new mongoose.Types.ObjectId().toString();
            const res = await chai.request(app).delete(`/api/admin/users/${targetId}`);
            expect(res).to.have.status(401);
        });
    });

    describe('GET /api/admin/trips (VP-107)', () => {
        it('returns 200 with all trips, sorted by createdAt desc, and owner populated as { _id, name, email }', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();

            sinon.stub(User, 'findById').callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: adminId,
                    name: 'Admin',
                    email: 'admin@vacayplan.com',
                    isAdmin: true,
                }),
            }));

            const trips = [
                {
                    _id: 't1',
                    destination: 'Bali',
                    createdAt: new Date('2026-05-26'),
                    userId: { _id: 'u1', name: 'Marker Test', email: 'marker@vacayplan.com' },
                },
                {
                    _id: 't2',
                    destination: 'Tokyo',
                    createdAt: new Date('2026-05-25'),
                    userId: { _id: 'u1', name: 'Marker Test', email: 'marker@vacayplan.com' },
                },
            ];

            const sortStub = sinon.stub().resolves(trips);
            const populateStub = sinon.stub().returns({ sort: sortStub });
            sinon.stub(Trip, 'find').returns({ populate: populateStub });

            const res = await chai.request(app)
                .get('/api/admin/trips')
                .set('Authorization', `Bearer ${tokenFor(adminId)}`);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array').with.lengthOf(2);
            expect(res.body[0].userId).to.include({ name: 'Marker Test', email: 'marker@vacayplan.com' });
            expect(populateStub.calledWith('userId', 'name email')).to.be.true;
            expect(sortStub.calledWith({ createdAt: -1 })).to.be.true;
        });

        it('returns an empty array when no trips exist', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();

            sinon.stub(User, 'findById').callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: adminId,
                    name: 'Admin',
                    email: 'admin@vacayplan.com',
                    isAdmin: true,
                }),
            }));

            sinon.stub(Trip, 'find').returns({
                populate: sinon.stub().returns({ sort: sinon.stub().resolves([]) }),
            });

            const res = await chai.request(app)
                .get('/api/admin/trips')
                .set('Authorization', `Bearer ${tokenFor(adminId)}`);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array').with.lengthOf(0);
        });

        it('returns 403 when the authenticated user is not an admin', async () => {
            const userId = new mongoose.Types.ObjectId().toString();

            sinon.stub(User, 'findById').callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: userId,
                    name: 'Regular',
                    email: 'user@test.com',
                    isAdmin: false,
                }),
            }));
            const findSpy = sinon.spy(Trip, 'find');

            const res = await chai.request(app)
                .get('/api/admin/trips')
                .set('Authorization', `Bearer ${tokenFor(userId)}`);

            expect(res).to.have.status(403);
            expect(findSpy.notCalled).to.be.true;
        });

        it('returns 401 when no token is provided', async () => {
            const res = await chai.request(app).get('/api/admin/trips');
            expect(res).to.have.status(401);
        });

        it('returns 500 when Trip.find chain throws', async () => {
            const adminId = new mongoose.Types.ObjectId().toString();

            sinon.stub(User, 'findById').callsFake(() => ({
                select: sinon.stub().resolves({
                    _id: adminId,
                    name: 'Admin',
                    email: 'admin@vacayplan.com',
                    isAdmin: true,
                }),
            }));

            sinon.stub(Trip, 'find').returns({
                populate: sinon.stub().returns({
                    sort: sinon.stub().rejects(new Error('db exploded')),
                }),
            });

            const res = await chai.request(app)
                .get('/api/admin/trips')
                .set('Authorization', `Bearer ${tokenFor(adminId)}`);

            expect(res).to.have.status(500);
            expect(res.body).to.have.property('message');
        });
    });
});
