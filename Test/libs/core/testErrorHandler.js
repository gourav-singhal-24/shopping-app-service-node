var expect = require('chai').expect;
//var describe = require('mocha').describe;
//var it = require('mocha').it;
var lodash = require('lodash');

var Logger = require('winston').Logger;
var Exception = require('../../../libs/core/Exception');
var ApiException = require('../../../libs/core/ApiException');

/**
 * Tests for /libs/core/ErrorHandler.js
 */
describe('ErrorHandler',function(){

    var ErrorHandler = require('../../../libs/core/ErrorHandler');

    describe('Constructor',function(){

        it('Should require a Logger instance as parameter.',function(){
            // error for bad input parameters.
            expect(function(){new ErrorHandler('a');}).throws(Error);
            expect(function(){new ErrorHandler({});}).throws(Error);
            expect(function(){new ErrorHandler([]);}).throws(Error);
        });

        it('Should create an instance of ErrorHandler, properties initialized.',function(){
            // make test instance
            var logger = lodash.create(Logger.prototype);
            var eh = new ErrorHandler(logger);

            // should be of ErrorHandler type
            expect(eh).instanceOf(ErrorHandler);

            // properties should be set
            expect(eh.logger).equal(logger);
        });

    });

    describe('log()',function(){

        it('Should require request object and Exception instance',function(){
            var eh = lodash.create(ErrorHandler.prototype);

            // error for bad input parameters
            expect(function(){eh.log(null)}).throw(Error);
            expect(function(){eh.log({},null)}).throw(Error);
            expect(function(){eh.log({},'a')}).throw(Error);
            expect(function(){eh.log({},{})}).throw(Error);
        });

        it('Should log request and error message and metadata to logger for Exception.',function(){
            // make test instance
            var logger = lodash.create(Logger.prototype);
            var eh = new ErrorHandler(logger);

            // Exception properties
            var meta = {message:'msg',details:'details',cause:'cause',stack:'stack'};

            // make an Exception
            var exp = lodash.create(Exception.prototype,meta);

            // fake request
            var req = {ip:'ip_address', path:'/path'};

            var errorCalled = false;
            logger.error = function(msg,meta){
                // logger must be called with correct message and metadata
                expect(msg).equal(meta.message);
                expect(meta).deep.equal(lodash.assign({},req,meta));

                // save invoke
                errorCalled = true;
            };

            // invoke log with request and Exception instance
            eh.log(req,exp);

            // logger's error() should be called.
            expect(errorCalled).true;
        });

        it('Should log request and error message and metadata to logger for ApiException.',function(){
            // make test instance
            var logger = lodash.create(Logger.prototype);
            var eh = new ErrorHandler(logger);

            // Exception properties
            var meta = {error_code:'error_code',message:'msg',details:'details',cause:'cause',stack:'stack'};

            // make an Exception
            var exp = lodash.create(ApiException.prototype,meta);

            // fake request
            var req = {ip:'ip_address', path:'/path'};

            var errorCalled = false;
            logger.error = function(msg,meta){
                // logger must be called with correct error code and metadata
                expect(msg).equal(meta.error_code);
                expect(meta).deep.equal(lodash.assign({},req,meta));

                // save invoke
                errorCalled = true;
            };

            // invoke log with request and Exception instance
            eh.log(req,exp);

            // logger's error() should be called.
            expect(errorCalled).true;
        });
    });

    describe('respond()',function(){
        it('Should require request object and ApiException instance',function(){
            var eh = lodash.create(ErrorHandler.prototype);

            // error for bad input parameters
            expect(function(){eh.respond(null)}).throw(Error);
            expect(function(){eh.respond({},null)}).throw(Error);
            expect(function(){eh.respond({},'a')}).throw(Error);
            expect(function(){eh.respond({},{})}).throw(Error);
        });

        it('Should respond with exact ApiException JSON for error of type ApiException.',function(){
            // make test instance
            var logger = lodash.create(Logger.prototype);
            var eh = new ErrorHandler(logger);

            // ApiException properties
            var meta = {httpCode:401,errorCode:"ERR",message:'msg',details:'details',cause:'cause',stack:'stack'};

            // make an ApiException
            var apiExp = lodash.create(ApiException.prototype,meta);

            var statusSet = false;
            var jsonSent = false;

            // fake response
            var res = {
                headerSent:false,
                status:function(s){
                    // should be called with correct HTTP status code
                    expect(s).equal(meta.httpCode);
                    // save invocation
                    statusSet = true;
                },
                json:function(j){
                    // should be called for JSON form of ApiException
                    expect(j).deep.equal(apiExp.toResponseJSON());
                    // save invocation
                    jsonSent = true;
                }
            };

            // call respond() with response and ApiException instance
            eh.respond(res,apiExp);

            // response status should be set
            expect(statusSet).true;

            // response json should be sent
            expect(jsonSent).true;
        });

        it('Should respond with ApiException.newInternalError() JSON for error NOT of type ApiException.',function(){
            // make test instance
            var logger = lodash.create(Logger.prototype);
            var eh = new ErrorHandler(logger);

            // arbitrary Exception properties
            var meta = {message:'msg',details:'details',cause:'cause',stack:'stack'};

            // make an Exception instance
            var exp = lodash.create(Exception.prototype,meta);

            // expected ApiException parameter of respond()
            var apiExp = ApiException.newInternalError(exp);

            var statusSet = false;
            var jsonSent = false;

            // fake response
            var res = {
                headersSent:false, // mark headers not sent yet
                status:function(s){
                    // should be called with correct HTTP code
                    expect(s).equal(apiExp.httpCode);
                    // save invocation
                    statusSet = true;
                },
                json:function(j){
                    // should be called with correct ApiException JSON
                    expect(j).deep.equal(apiExp.toResponseJSON());
                    // save invocation
                    jsonSent = true;
                }
            };

            // call respond with response and arbitrary Exception instance
            eh.respond(res,exp);

            // response status should be set
            expect(statusSet).true;

            // response json should be sent
            expect(jsonSent).true;
        });

        it('Should not respond if request headers already sent.',function(){
            // make test instance
            var logger = lodash.create(Logger.prototype);
            var eh = new ErrorHandler(logger);

            var statusSet = false;
            var jsonSent = false;

            // fake response
            var res = {
                headersSent:true, // mark headers as already sent
                status:function(){
                    // save invocation
                    statusSet = true;
                },
                json:function(){
                    // save invocation
                    jsonSent = true;
                }
            };

            // make an arbitrary Exception instance
            var exp = lodash.create(Exception.prototype);

            // call respond with response and arbitrary Exception instance
            eh.respond(res,exp);

            // status should not be set
            expect(statusSet).false;

            // json should not be sent
            expect(jsonSent).false;

        });
    });

    describe('build()',function(){

        it('Should generate a error handling middleware that calls log and respond methods for errors.', function(){
            // make test instance
            var logger = lodash.create(Logger.prototype);
            var eh = new ErrorHandler(logger);

            // fake, request, response and forwarded error
            var req = {};
            var res = {};
            var error = 'some_error';

            var logCalled= false;
            // mock log method
            eh.log = function(r,e){
                // should be called with request and exception
                expect(r).equal(req);
                expect(e).instanceOf(Exception);
                // save invocation
                logCalled = true;
            };

            var respondCalled = false;
            // mock respond method
            eh.respond = function(r,e){
                // should be called with request and exception
                expect(r).equal(res);
                expect(e).instanceOf(Exception);
                // save invocation
                respondCalled = true;
            };

            // build middleware
            var mw = eh.build();

            // must be an error-handling middleware
            expect(mw).a('function');
            expect(mw.length).equal(4);

            var nextCalled = false;
            // mock next callback
            mw(error,req,res,function(err){
                // error should be handled and not forwarded to next middleware
                expect(err === undefined).true;
                // save invocation
                nextCalled = true;
            });

            // log should be called
            expect(logCalled).true;

            // respond should be called
            expect(respondCalled).true;

            // next should be called
            expect(nextCalled).true;
        });

        it('Should generate a middleware that does not log or respond if no error is propagated to it,' +
            ' but still calls next.',function(){

            // make test instance
            var logger = lodash.create(Logger.prototype);
            var eh = new ErrorHandler(logger);

            // fake request and response
            var req = {};
            var res = {};

            var logCalled= false;
            // fake log method
            eh.log = function(){
                // save invocation
                logCalled = true;
            };

            var respondCalled = false;
            // fake respond method
            eh.respond = function(){
                // save invocation
                respondCalled = true;
            };

            // build middleware
            var mw = eh.build();

            var nextCalled = false;
            // invoke middleware with a "null" error and a next callback
            mw(null,req,res,function(err){
                // must not have an error forwarded, as none sent
                expect(err == null).true;
                // save invocation
                nextCalled = true;
            });

            // invoke middleware with a "null" error and a next callback
            mw(undefined,req,res,function(err){
                // must not have an error, as none sent, and none forwarded
                expect(err == undefined).true;
                // save invocation
                nextCalled = true;
            });

            // log should not be called
            expect(logCalled).false;

            // respond should not be called
            expect(respondCalled).false;

            // next should be called
            expect(nextCalled).true;

        });
    });

});
