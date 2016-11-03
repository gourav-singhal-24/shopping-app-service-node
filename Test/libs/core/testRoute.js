var expect = require('chai').expect;
//var describe = require('mocha').describe;
//var it = require('mocha').it;
var util = require('util');
var wrench = require('wrench');
var fs = require('fs');
var path = require('path');
var os = require('os');
var uuid = require('node-uuid');
var lodash = require('lodash');

/**
 * Tests for /libs/core/Route.js
 */
describe('Route',function(){

    var Route = require('../../../libs/core/Route');

    describe('Constructor',function(){

        it('Should create a new Route instance, with properties initialized.',function(){
            var route = new Route('get','/path');
            expect(route).instanceOf(Route);
            expect(route.method).equal('get');
            expect(route.path).equal('/path');
            expect(route.middlewares).to.be.an('Array');
        });

        it('Should require a method from allowed methods and a path.',function(){
            expect(function(){new Route('wrong','/path')}).throws(Error);
            expect(function(){new Route(null,'/path')}).throws(Error);
            expect(function(){new Route('get',null)}).throws(Error);

            Route.REQUEST_METHODS.forEach(function(m){
                expect(function(){new Route(m,'/path')}).not.throws(Error);
            });
        });

    });

    describe('use',function(){

        it('should add the provided middleware(s) to its middleware list',function(){
            var route = new Route('get','/path');

            var mw = function(req,res,next){};
            route.use(mw);

            expect(route.middlewares).to.be.deep.equals([mw]);

            route.use(mw,mw);

            expect(route.middlewares).to.be.deep.equals([mw,mw,mw]);
        });

    });

    describe('mount',function(){

        it('should user internal middleware list on provided router, with correct method and path.',function(){
            var route = new Route('get','/path');

            var getCalled = false;
            var postCalled = false;
            var extRouter = {
                'get':function(path,midllewares){
                            expect(path).equals('/path');
                            expect(midllewares).equals(route.middlewares);
                            getCalled = true;
                        },
                'post':function(){
                    postCalled = true;
                }
            };



            route.mount(extRouter);
            expect(getCalled).to.be.true;
            expect(postCalled).to.be.false;
        });

    });

    describe('scanAll',function(){

        var rootDir = null;
        var routePath = lodash.escapeRegExp(path.resolve(__dirname,'../../../libs/core/Route'));
        var moduleSource = "var Route = require('"+routePath+"');\nmodule.exports = new Route('get','/path');";

       beforeEach(function(){
            rootDir = path.join(os.tmpdir(),uuid.v4());
            fs.mkdirSync(rootDir);
       });

        afterEach(function(){
            wrench.rmdirSyncRecursive(rootDir,true);
        });

       it('Should scan only Route modules in a folder, if not recursive.',function(){
            fs.writeFileSync(path.join(rootDir,'route1.js'),moduleSource);
            fs.writeFileSync(path.join(rootDir,'route2.js'),moduleSource);
            fs.mkdirSync(path.join(rootDir,'dir1'));
            fs.writeFileSync(path.join(rootDir,'dir1','route3.js'),moduleSource);

            var routes = Route.scanAll(rootDir,false);
            expect(routes.length).equal(2);

            routes.forEach(function(r){
                expect(r).instanceOf(Route);
            });
       });

        it('Should scan all Route module in a folder recursively.',function(){
            fs.writeFileSync(path.join(rootDir,'route1.js'),moduleSource);
            fs.writeFileSync(path.join(rootDir,'route2.js'),moduleSource);
            fs.mkdirSync(path.join(rootDir,'dir1'));
            fs.writeFileSync(path.join(rootDir,'dir1','route3.js'),moduleSource);

            var routes = Route.scanAll(rootDir,true);
            expect(routes.length).equal(3);

            routes.forEach(function(r){
                expect(r).instanceOf(Route);
            });
        });

        it('Should throw error if path contains a module which is not of Route type.',function(){
            fs.writeFileSync(path.join(rootDir,'route1.js'),"module.exports = new Object();");
            expect(function(){Route.scanAll(rootDir,true);}).throws(Error);
        });
    });
});
