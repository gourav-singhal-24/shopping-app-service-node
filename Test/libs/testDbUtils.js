var expect = require('chai').expect;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var config = require('config');

/**
 * Tests for /libs/dbUtils.js
 */
describe('dbUtils', function () {
    var mongoose ={};
    var mongooseStub = sinon.stub().returns(mongoose);
    
    var dbUtils = proxyquire('../../libs/dbUtils', {
        'mongoose':{connect:mongooseStub} 
    })
    
    describe('getMongoDB', function() {

    it('Should define a function getMongoDB in dbUtils.', function() {
      expect(dbUtils.getMongoDB).to.be.a('function');
    });

    it('Should return an instance of mongoDB db driver.', function() {
      expect(dbUtils.getMongoDB()).to.be.equal(mongoose);
    });

  });
});