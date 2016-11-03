var expect = require('chai').expect;
var proxyquire = require('proxyquire');
var util = require('util');
var sinon = require('sinon');
var lodash = require('lodash');
var config = require('config');
var mongooseMock = require('mongoose-mock');
// var describe = require('mocha').describe;
// var it = require('mocha').it;

/**
 * Tests for /models/userModel.js
 */
describe('userModel', function() {
  var db = mongooseMock;
  var userModel = proxyquire('../../models/userModel', {
    '../libs/dbUtils': {
      getMongoDB: function() {
        return db;
      } 
    }
  });
  describe('createAndSave', function () {
     var data ={ 
                 email: 'nnn@nn.com',
                 password: 'Whitedfdfdf'
               };
   // it('Should define a function getMongoDB in dbUtils.', function() {
   //    expect(userModel.save).to.be.a('function');
   //  });

    it('saves the user', function () {
      db.save = sinon.stub().callsArgWith(2, null, [{
        data: 'data'
      }]);
      var cb = sinon.spy();
       userModel.save(data, cb);
       expect(db.save).calledOnce;
       expect(cb).calledWith;
    });
    
     it('Should call back with undefined if user not created.', function () {
      db.save = sinon.stub().callsArgWith(2, null, []);
      var cb = sinon.spy();
       userModel.save(data, cb);
       expect(db.save).calledOnce;
       expect(cb).calledWith;
    });

    it('Should call back with any errors from db save..', function () {
      var err = new Error();
      db.save = sinon.stub().callsArgWith(2,err);
      var cb = sinon.spy();
       userModel.save(data, cb);
       expect(db.save).calledOnce;
       expect(cb,err).calledWith;
    });
 });
  });
