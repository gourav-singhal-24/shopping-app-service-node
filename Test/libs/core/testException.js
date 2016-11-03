var expect = require('chai').expect;
//var describe = require('mocha').describe;
//var it = require('mocha').it;
var util = require('util');


/**
 * Tests for /libs/core/Exception.js
 */
describe('Exception',function(){

    var Exception = require('../../../libs/core/Exception');

    describe('Constructor',function(){

        it('Should create a new Instance of Exception class',function(){
            // should be of Exception type
            expect(new Exception('msg',null)).an.instanceOf(Exception);
        });

        it('Should auto convert message and cause to appropriate types.',function(){
            // message should be converted to string, and cause to an Error or at least a string.
            expect(new Exception('msg',null).message).equal('msg');
            expect(new Exception({a:1},null).message).equal(util.inspect({a:1}));
            expect(new Exception('msg',{a:1}).cause).equal(util.inspect({a:1}));
            expect(new Exception('msg','cause').cause).equal('cause');
            expect(new Exception('msg',new Error()).cause).instanceOf(Error);
        });

        it('Should save an error stack and initialize details array.',function(){
            // stack and details should be initialized
            expect(new Exception('msg','cause').stack).a('String');
            expect(new Exception('msg','cause').details).an('array');
        });
    });

    describe('Exception.from()',function(){

        it('Should return same object if its already an Exception',function(){
            var ex = new Exception('msg');
            expect(Exception.from(ex)).equal(ex);
        });

        it('Should auto convert given object to an Exception',function(){
            expect(Exception.from('msg')).instanceOf(Exception);

            // should auto convert Exception properties from data
            expect(Exception.from('msg').message).equal('msg');
            expect(Exception.from(new Error('msg')).message).equal('msg');
            expect(Exception.from(new Error('msg')).cause).instanceOf(Error);
            expect(Exception.from({a:1}).message).equal(Exception.DEFAULT_ERR_MSG);
            expect(Exception.from({a:1}).cause).equal(util.inspect({a:1}));
        });

    });

    describe('addDetails()',function(){

        it('Should add single detail message to Exception details array, converting to appropriate message',function(){
            var ex = new Exception('msg');
            ex.addDetails('detail').addDetails({a:1});

            // details array should be updated
            expect(ex.details).an('Array');
            expect(ex.details.length).equal(2);
            expect(ex.details[0]).equal('detail');
            expect(ex.details[1]).equal(util.inspect({a:1}));
        });

        it('Should add messages array to Exception details array, converting to each to appropriate message',function(){
            var ex = new Exception('msg');
            ex.addDetails(['detail',{a:1}]);

            // details array should be updated
            expect(ex.details).an('Array');
            expect(ex.details.length).equal(2);
            expect(ex.details[0]).equal('detail');
            expect(ex.details[1]).equal(util.inspect({a:1}));
        });

    });
});