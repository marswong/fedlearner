const assert = require('assert');
const { Op } = require('sequelize');
const supertest = require('supertest');
const grpc = require('@grpc/grpc-js');
const server = require('../fixtures/server');
const models = require('../../models');
const { admin } = require('../fixtures/user');
const federations = require('../fixtures/federation');
const tickets = require('../fixtures/ticket');
const rpcServer = require('../../rpc/server');

const { Federation, User, Ticket } = models;
const request = supertest(server.callback());
let adminCookie;
let leader;
let follower;
let followerTicket;

async function setupDatabase() {
  await models.sequelize.sync();

  const [adminRecord] = await User.findOrCreate({
    paranoid: false,
    where: {
      username: { [Op.eq]: admin.username },
    },
    defaults: admin,
  });
  if (adminRecord.deleted_at) {
    adminRecord.restore();
  }
}

describe('Activity API', () => {
  before(async () => {
    await setupDatabase();
    return new Promise((resolve, reject) => {
      request.post('/api/v1/login')
        .send({ username: admin.username, password: admin.username })
        .expect(200)
        .end((err, res) => {
          if (err) reject(err);
          adminCookie = res.header['set-cookie'].map((x) => x.split(';')[0]).join('; ');
          resolve();
        });
    });
  });

  describe('GET /api/v1/federations', () => {
    it('should return all federations', (done) => {
      request.get('/api/v1/federations')
        .set('Cookie', adminCookie)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          assert.ok(res.body.data.find((x) => x.name === leader.name));
          assert.ok(res.body.data.find((x) => x.name === follower.name));
          done();
        });
    });
  });
});
