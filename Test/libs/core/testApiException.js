var expect = require('chai').expect;
//var describe = require('mocha').describe;
//var it = require('mocha').it;
var util = require('util');


var Exception = require('../../../libs/core/Exception');


/**
 * Tests for /libs/core/ApiException.js
 */
describe('ApiException',function(){

    var ApiException = require('../../../libs/core/ApiException');

    describe('Constructor',function(){

        it('Should create an instance of ApiException, inheriting from Exception', function(){

            var ae = new ApiException(100,'err_code','msg','cause');

            // should be of  and super class type
            expect(ae).instanceOf(ApiException).and.instanceOf(Exception);

            // super class properties must also be initialized.
            expect(ae).property('message','msg');
            expect(ae).property('stack');
            expect(ae).property('cause','cause');
            expect(ae).property('details');
        });

        it('Should require an Number http status and String error code input types.', function(){
            // bad input parameters should be rejected
            expect(function(){new ApiException('a','err_code','msg','cause');}).throws(Error);
            expect(function(){new ApiException(1,1,'msg','cause');}).throws(Error);
            expect(function(){new ApiException(1,'CODE','msg','cause');}).not.throws(Error);
        });

        it('Should initialise http status and error code from provided values.', function(){
            expect(new ApiException(100,'err_code','msg','cause').httpCode).equal(100);
            expect(new ApiException(100,'err_code','msg','cause').errorCode).equal('err_code');
        })

    });

    describe('toJSON()',function(){

        it('Should return JSON representation of ApiException',function(){

            // make an ApiException
            var ae = new ApiException(100,'err_code','msg','cause');
            ae.addDetails(['d1','d2']);
            ae.addDetails('d3');

            // get JSON form
            var json = ae.toResponseJSON();

            // JSON form should match ApiException data
            expect(json).an('Object');
            expect(json.error_code).equal('err_code');
            expect(json.Message).equal('msg');
            expect(json.Data).an('Array');
            expect(json.Data).deep.equal(['d1','d2','d3']);
        });
    });

    describe('ApiException.newBadRequestError()',function(){

        it('Should create a Bad Request ApiException.',function(){
            // provided and pre-defined properties should be set
            expect(ApiException.newBadRequestError('cause')).instanceOf(ApiException);
            expect(ApiException.newBadRequestError('cause').errorCode).equal(ApiException.EC_BAD_REQUEST);
            expect(ApiException.newBadRequestError('cause').cause).equal('cause');
            expect(ApiException.newBadRequestError('cause').httpCode).equal(ApiException.SC_BAD_REQUEST);
            expect(ApiException.newBadRequestError('cause').message).equal(ApiException.MSG_BAD_REQUEST);
        });

    });

    describe('ApiException.newUnauthorizedError()',function(){

        it('Should create a Unauthorized ApiException.',function(){
            // provided and pre-defined properties should be set
            expect(ApiException.newUnauthorizedError('err_code','cause')).instanceOf(ApiException);
            expect(ApiException.newUnauthorizedError('err_code','cause').errorCode).equal('err_code');
            expect(ApiException.newUnauthorizedError('err_code','cause').cause).equal('cause');
            expect(ApiException.newUnauthorizedError('err_code','cause').httpCode).equal(ApiException.SC_UNAUTHORIZED);
            expect(ApiException.newUnauthorizedError('err_code','cause').message).equal(ApiException.MSG_UNAUTHORIZED);
        });

    });

    describe('ApiException.newNotAllowedError()',function(){

        it('Should create a Not Allowed ApiException.',function(){
            // provided and pre-defined properties should be set
            expect(ApiException.newNotAllowedError('err_code','cause')).instanceOf(ApiException);
            expect(ApiException.newNotAllowedError('err_code','cause').errorCode).equal('err_code');
            expect(ApiException.newNotAllowedError('err_code','cause').cause).equal('cause');
            expect(ApiException.newNotAllowedError('err_code','cause').httpCode).equal(ApiException.SC_FORBIDDEN);
            expect(ApiException.newNotAllowedError('err_code','cause').message).equal(ApiException.MSG_FORBIDDEN);
        });

    });

    describe('ApiException.newNotFoundError()',function(){

        it('Should create a Not Found ApiException.',function(){
            // provided and pre-defined properties should be set
            expect(ApiException.newNotFoundError('cause')).instanceOf(ApiException);
            expect(ApiException.newNotFoundError('cause').errorCode).equal(ApiException.EC__NOT_FOUND);
            expect(ApiException.newNotFoundError('cause').cause).equal('cause');
            expect(ApiException.newNotFoundError('cause').httpCode).equal(ApiException.SC_NOT_FOUND);
            expect(ApiException.newNotFoundError('cause').message).equal(ApiException.MSG_NOT_FOUND);
        });

    });

    describe('ApiException.newInternalError()',function(){

        it('Should create an Internal Error ApiException.',function(){
            // provided and pre-defined properties should be set
            expect(ApiException.newInternalError('cause')).instanceOf(ApiException);
            expect(ApiException.newInternalError('cause').errorCode).equal(ApiException.EC_INTERNAL_ERROR);
            expect(ApiException.newInternalError('cause').cause).equal('cause');
            expect(ApiException.newInternalError('cause').httpCode).equal(ApiException.SC_INTERNAL_ERROR);
            expect(ApiException.newInternalError('cause').message).equal(ApiException.MSG_INTERNAL_ERROR);
        });

    });

});