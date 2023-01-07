const request = require('supertest');
const app = require('../apis');
const assert = require('assert');

describe('GET /api/transactions/:id', function () {
  it('responds with 200 and a list of transactions for the user', function (done) {
    request(app)
      .get('/api/transactions/rHMloPoyB1Z6XhxJ3HhKWUFOuam2')
      .expect(200)
      .expect(function (res) {
        assert(Array.isArray(res.body));
        console.log(res.body)
      })
      .end(done);
  });
});
