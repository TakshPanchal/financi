const request = require('supertest');
// app is supposed to point to the app.js file
const app = require('../apis');
const assert = require("assert");

describe('Testing POSTS/shots endpoint', function () {
    it('respond with valid HTTP status code and the inserted row', function (done) {
      // Make POST Request
      request(app)
      .post('/api/transactions')
      .send({
        user_id: '829021323578245121',
        merchant_name: 'DMart',
        amount: '500',
        closing_balance: '1000',
        tag_id: '1',
        type: '0',
        date: '01-01-2023',
        description: 'DMartQRCode',
        reference_number: '123'
      })
      .expect(200)
      .expect(function (res) {
        //assert.strictEqual(res.body.user_id, '829021323578245121');
        //assert.strictEqual(res.body.merchant_name, 'DMart');
        // add assertions for the other fields here
      })
      .end(done);
  });
});