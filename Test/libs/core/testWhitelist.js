var expect = require('chai').expect;
//var describe = require('mocha').describe;
//var it = require('mocha').it;

/**
 * Tests for /libs/core/Whitelist.js
 */
describe('Whitelist',function() {

    var Whitelist = require('../../../libs/core/Whitelist');

    describe('Constructor',function(){

        it('Should create a new instance of Whitelist, properties initialised.',function(){
            var wh = new Whitelist();

            // should be Whitelist type
            expect(wh).instanceOf(Whitelist);

            // properties should be initialized
            expect(wh.paths).an('Array');
            expect(wh.middlewares).an('Array');
        });

    });

    describe('allow()',function(){

        it('Should require path as string or array of strings.',function(){
            var wh = new Whitelist();

            // error for bad parameters
            expect(function(){wh.allow(null);}).throws(Error);
            expect(function(){wh.allow(123);}).throws(Error);
            expect(function(){wh.allow([123]);}).throws(Error);
            expect(function(){wh.allow([null,'/path']);}).throws(Error);
            expect(function(){wh.allow([null,{}]);}).throws(Error);
        });

        it('Should append path or array of paths to white-listed paths.',function(){
            var wh = new Whitelist();

            // append single path
            wh.allow('/login');

            // append array of paths
            wh.allow(['/invite','/register']);

            // paths should be appended
            expect(wh.paths).deep.equals(['/login','/invite','/register']);
        });

    });

    describe('use()',function(){
        it('require function as parameter',function(){
            var wh = new Whitelist();

            // error for bad parameters
            expect(function(){wh.use('abc');}).throws(Error);
            expect(function(){wh.use({});}).throws(Error);
            expect(function(){wh.use([]);}).throws(Error);
        });

        it('Should append given middleware to local middleware array',function(){
            var wh = new Whitelist();

            var mw = function(){};

            // add middleware
            wh.use(mw);
            wh.use(mw);

            // middleware should be collected
            expect(wh.middlewares).deep.equals([mw,mw]);
        });
    });

    describe('build()',function(){

        it('Should generate a middleware that bypasses all use()\'d middleware, ' +
            'when request path is allow()\'d.',function(){

            var wh = new Whitelist();

            // allow for a path
            wh.allow('/login');

            // fake request for same path and response
            var request = {path:'/login'};
            var response = {};

            var nextCalled = false;
            // fake next callback
            var nextCallback = function(){
                // save invocation
                nextCalled = true;
            };

            var mw1Called = false;
            var mw2Called = false;

            // use middleware
            wh.use(function(req,res,next){
                // save invocation
                mw1Called = true;
                next();
            }).use(function(req,res,next){
                // save invocation
                mw2Called = true;
                next();
            });

            // build middleware
            var whmw = wh.build();

            // should be a middleware function
            expect(whmw).a('function');
            expect(whmw.length).equal(3);

            // invoke middleware
            whmw(request,response,nextCallback);

            //middleware should not be called
            expect(mw1Called).false;

            //middleware should not be called
            expect(mw2Called).false;

            // next should be called directly, bypassing used middleware
            expect(nextCalled).true;
        });

        it('Should generate a middleware that invokes all use()\'d middleware, ' +
            'when request path is NOT allow()\'d.',function(){

            var wh = new Whitelist();

            // allow a path
            wh.allow('/login');

            // fake request for a different path, and response
            var request =  {path:'/not_login',url:'http:api/login'};
            var response = {};

            var nextCalled = false;
            // fake next callback
            var nextCallback = function(){
                // save invocation
                nextCalled = true;
            };

            var mw1Called = false;
            var mw2Called = false;
            // use middleware
            wh.use(function(req,res,next){
                // should be called with request, response and next
                expect(req).equal(request);
                expect(res).equal(response);
                expect(next).a('function');
                // save invocation
                mw1Called = true;
                next();
            }).use(function(req,res,next){
                // should be called with request, response and next
                expect(req).equal(request);
                expect(res).equal(response);
                expect(next).a('function');
                // save invocation
                mw2Called = true;
                next();
            });

            // build middleware
            var whmw = wh.build();

            // should be a middleware function
            expect(whmw).a('function');
            expect(whmw.length).equal(3);

            // invoke middleware
            whmw(request,response,nextCallback);

            //middleware should be called
            expect(mw1Called).true;

            //middleware should be called
            expect(mw2Called).true;

            //next should be called
            expect(nextCalled).true;
        });

        it('Should generate a middleware that invokes error middleware in chain case of an error, ' +
            'when request path is NOT allow()\'d.',function(){

            var wh = new Whitelist();

            // allow a path
            wh.allow('/login');

            // fake error, request for a different path and response
            var error = 'some_error';
            var request = {path:'/not_login'};
            var response = {};

            var nextCalled = false;
            // fake next callback
            var nextCallback = function(err,req,res,next){
                // should be called with forwarded error
                expect(err).equal(error);
                // save invocation
                nextCalled = true;
            };

            var mw1Called = false;
            var mw2Called = false;
            var mw3Called = false;
            // use middleware
            wh.use(function(req,res,next){
                // should be called with request,response and next
                expect(req).equal(request);
                expect(res).equal(response);
                expect(next).a('function');
                // save invocation
                mw1Called = true;
                // pass error
                next(error);
            }).use(function(req,res,next){
                // save invocation, is not supposed to be called
                mw2Called = true;
                next(err);
            }).use(function(err,req,res,next){
                // should be called with forwarded error
                expect(err).equal(error);
                // save invocation
                mw3Called = true;
                // forward error further
                next(err);
            });

            // build middleware
            var whmw = wh.build();

            // should be a middleware function
            expect(whmw).a('function');
            expect(whmw.length).equal(3);

            // invoke middleware
            whmw(request,response,nextCallback);

            // error generating middleware should be called
            expect(mw1Called).true;

            // non error-handling middleware should skipped
            expect(mw2Called).false;

            // error-handling middleware should called
            expect(mw3Called).true;

            // error-handling middleware should called
            expect(nextCalled).true;
        });

    });
});
