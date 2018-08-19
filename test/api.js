const request = require('supertest');

describe('POST /shorten', function() {

  // If the shortening function is working properly
  it('shorten the url', function(done) {
    request('http://localhost:3000')
      .post('/shorten')
      .send({ "url" : "https://www.google.com" })
      .expect(200, done);
  });

  // If same shortened url is generated for same urls
  it('for different urls', function(done) {
    request('http://localhost:3000')
      .post('/shorten')
      .send({ "url" : "https://www.google.com" })
      .end(function(res1) {
        request('http://localhost:3000')
          .post('/shorten')
          .send({ "url" : "http://google.com" })
          .expect(function(res2) {
            res1.body.url = res2.body.url;
          }, done())
      });
  });

});
