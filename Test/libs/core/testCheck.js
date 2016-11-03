var expect = require('chai').expect;
//var describe = require('mocha').describe;
//var it = require('mocha').it;
var util = require('util');
var lodash = require('lodash');

/**
 * Tests for /libs/core/Check.js
 */
describe('Check',function(){

    var Check = require('../../../libs/core/Check');

    describe('Constructor',function(){

        it('Should create an instance of Check, properties initialized.',function(){
            var check = new Check('value');
            expect(check).to.be.instanceOf(Check);
            expect(check.errors).to.be.an('Array');
            expect(check.val).to.be.equal('value');

            // errors recorded by default
            expect(check.recordErrors).to.be.true;
        });


    });

    describe('Check.that',function(){
        it('Should create an instance of Check, with provided value.',function(){
            var check = Check.that('value');
            expect(check).to.be.instanceOf(Check);
            expect(check.errors).to.be.an('Array');
            expect(check.val).to.be.equal('value');

            // errors recorded by default
            expect(check.recordErrors).to.be.true;
        });
    });

    describe('resolve',function(){

        it('Should require Boolean, String as parameters.',function(){
            var check = Check.that('value');
            expect(function(){check.resolve();}).to.throws(Error);
            expect(function(){check.resolve(1,null);}).to.throws(Error);
            expect(function(){check.resolve('a','a');}).to.throws(Error);
        });

        it('Should by default collect given error if valid parameter is false.',function(){
            var check = Check.that('value');

            expect(check.errors).to.be.deep.equal([]);

            check.resolve(false,'error_message');

            expect(check.errors).to.be.deep.equal(['error_message']);
        });

        it('Should by default NOT collect given error if valid parameter is false.',function(){
            var check = Check.that('value');

            expect(check.errors).to.be.deep.equal([]);

            check.resolve(true,'error_message');

            expect(check.errors).to.be.deep.equal([]);
        });

        it('Should NEVER collect given error if recordErrors property is false.',function(){
            var check = Check.that('value');

            check.recordErrors = false;

            expect(check.errors).to.be.deep.equal([]);

            check.resolve(true,'error_message');
            check.resolve(false,'error_message');

            expect(check.errors).to.be.deep.equal([]);
        });

    });

    describe('collectErrorMessages',function(){

        it('Should require input parameter to be a plain object.',function(){
            expect(function(){Check.collectErrorMessages('a');}).to.throws(Error);
            expect(function(){Check.collectErrorMessages(123);}).to.throws(Error);
            expect(function(){Check.collectErrorMessages([]);}).to.throws(Error);
            expect(function(){Check.collectErrorMessages(new Check('a'));}).to.throws(Error);
        });

        it('Should collect errors from all properties of given object that are Check instances.',function(){

            var check1 = Check.that('value');
            check1.errors = ['msg11','msg12'];

            var check2 = Check.that('value');
            check2.errors = ['msg21'];

            var rules = {
                key1:check1,
                key2:check2,
                key3:{} // not a check instance
            };

            var errors = Check.collectErrorMessages(rules);

            expect(errors).to.be.an("Array");
            expect(errors).to.be.deep.equal([{field:'key1',errors:check1.errors},{field:'key2',errors:check2.errors}]);

        });

    });

    describe('is.ok',function(){
        it('Should return true if no errors collected, false otherwise.',function(){
            var check = new Check('value');
            var is = check.is();
            expect(is).to.be.an('Object');
            expect(is.ok).to.be.a('function');

            // no errors
            expect(is.ok()).to.be.true;

            check.errors.push('error1');

            // has errors
            expect(is.ok()).to.be.false;
        });
    });

    describe('assert.ok',function(){
        it('Should throw an Error with collected messages if there ARE errors, otherwise do nothing.',function(){
            var check = new Check('value');
            var ca = check.assert();
            expect(ca).to.be.an('Object');
            expect(ca.ok).to.be.a('function');

            // no errors
            expect(ca.ok).to.not.throw;

            check.errors.push('error1');

            // has errors
            expect(ca.ok).to.throws(Error);
        });
    });

    describe('isOptional',function(){

        it('Should set recordErrors property to false if check value is null or undefined.',function(){

            // ---------value not null------------
            var check = new Check('value');

            // errors recorded by default
            expect(check.recordErrors).to.be.true;

            check.isOptional();

            // errors should be still recorded because value is not null or undefined
            expect(check.recordErrors).to.be.true;

            // -----------value is null-----------
            var check1 = new Check(null);

            // errors recorded by default
            expect(check1.recordErrors).to.be.true;

            check1.isOptional();

            // errors should  not be recorded because value is null
            expect(check1.recordErrors).to.be.false;

            // -----------value is undefined-----------
            var check2 = new Check();

            // errors recorded by default
            expect(check2.recordErrors).to.be.true;

            check2.isOptional();

            // errors should  not be recorded because value is undefined
            expect(check2.recordErrors).to.be.false;
        });

    });

    //------------- test validations -----------------

    describe('isMatch',function(){
        it('Should test check values against a regex, and call resolve accordingly.',function(){

            var check = Check.that('alphabet');
            var resolveCalled = false;
            var resolveValid = false;
            var resolveMsg = null;
            var resolve = check.resolve;

            check.resolve = function(v,m){
                resolveCalled = true;
                resolveValid = v;
                resolveMsg = m;
                resolve.apply(check,arguments);
            };

            // pass
            resolveCalled = false;
            resolveValid = false;
            resolveMsg = null;
            check.isMatch(/a\w+/,'msg');
            expect(resolveCalled).to.be.true;
            expect(resolveValid).to.be.true;
            expect(resolveMsg).to.be.equal('msg');

            // fail
            resolveCalled = false;
            resolveValid = false;
            resolveMsg = null;
            check.isMatch(/abc/,'msg');
            expect(resolveCalled).to.be.true;
            expect(resolveValid).to.be.false;
            expect(resolveMsg).to.be.equal('msg');
        })
    });
});