var request = require('supertest'),
    assert=require('assert'),
	url="http://localhost:3000"
	
 describe('Array Index', function() {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});

