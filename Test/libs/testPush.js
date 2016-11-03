var expect = require('chai').expect;
//var describe = require('mocha').describe;
//var it = require('mocha').it;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var util = require('util');
var uuid = require('node-uuid');
var os = require('os');
var fs = require('fs');
var path = require('path');
var lodash = require('lodash');


/**
 * Tests for Push.js
 */
/* istanbul ignore next */
describe('Push.js', function () {

    // mock replacements
    var apn = {};
    var gcm = {};

    // module with mocks
    var Push = proxyquire('../../libs/Push', {
        'apn': apn,
        'node-gcm': gcm,
        './appUtils': {
            logger: { // stub out logger as well
                info: sinon.stub(),
                warn: sinon.stub(),
                error: sinon.stub()
            }
        }
    });

    // mock file paths
    var tmpFile = path.join(os.tmpdir(), uuid.v4() + '.tmp');

    // test suite setup
    before(function () {
        // create temp file
        var fd = fs.openSync(tmpFile, 'a');
        fs.closeSync(fd);
    });

    // test suite tear down
    after(function () {
        // clean temp file. Same file for both apn cert and key.
        fs.unlinkSync(tmpFile);
    });

    // setup mocks before every test
    beforeEach(function () {

        apn.Connection = function () {
            this.args = arguments;
            this.pushNotification = sinon.spy();
            this.on = sinon.spy();
        };
        apn.Feedback = function () {
            this.args = arguments;
            this.on = sinon.spy();
        };

        apn.Notification = function () {
            this.args = arguments;
        };

        gcm.Sender = function () {
            this.args = arguments;
            this.send = sinon.spy();
        };

        gcm.Message = function () {
            this.args = arguments;
            this.addData = sinon.stub();
            this.addNotification = sinon.stub();
        };
    });

    describe('Constructor', function () {
        it('Should create a new Push Instance.', function () {
            expect(new Push()).to.be.instanceOf(Push);
        });
    });

    describe('initApn()', function () {

        it('should throw errors for invalid values.', function () {
            var push = new Push();
            expect(function () {
                push.initApn()
            }).to.throw(Error);
            expect(function () {
                push.initApn("")
            }).to.throw(Error);
            expect(function () {
                push.initApn(true, "/not/exists", null)
            }).to.throw(Error);
            expect(function () {
                push.initApn(true, "/not/exists", tmpFile)
            }).to.throw(Error);
            expect(function () {
                push.initApn(true, null, "/not/exists/")
            }).to.throw(Error);
            expect(function () {
                push.initApn(true, tmpFile, "/not/exists/")
            }).to.throw(Error);
            expect(function () {
                push.initApn(true, "/not/exists", "/not/exists")
            }).to.throw(Error);
        });

        it('should initialize apn module correctly for correct values', function () {
            var push = new Push();

            // expected apn configuration
            var conf = {
                'production': true,
                'cert': tmpFile,
                'key': tmpFile
            };

            // initialize apn
            push.initApn(conf.production, conf.cert, conf.key);

            // should initialize apn connection
            expect(push.apnConn.args[0]).to.be.deep.equal(conf);
            sinon.assert.calledWith(push.apnConn.on, 'transmissionError', sinon.match.func);

            // should initialize apn feedback
            expect(push.apnFeedback.args[0]).to.contain(conf);
            sinon.assert.calledWith(push.apnFeedback.on, 'feedback', sinon.match.func);
        });

    });

    describe('initGcm()', function () {

        it('should throw errors for invalid values.', function () {
            var push = new Push();
            expect(function () {
                push.initGcm()
            }).to.throw(Error);
            expect(function () {
                push.initGcm(123)
            }).to.throw(Error);
            expect(function () {
                push.initGcm(null)
            }).to.throw(Error);
        });

        it('should initialize node-gcm module correctly for correct values', function () {
            var gcmKey = "GCM_KEY";
            var push = new Push();

            push.initGcm(gcmKey);

            // should initialize gcm sender
            expect(push.gcmSender.args[0]).to.be.equal(gcmKey);
        });

    });

    describe('setApnNoteFormatter', function () {

        it('should throw error for inputs that are not functions', function () {
            var push = new Push();
            expect(function () {
                push.setApnNoteFormatter(null)
            }).to.throw(Error);
            expect(function () {
                push.setApnNoteFormatter('abc')
            }).to.throw(Error);
            expect(function () {
                push.setApnNoteFormatter({
                    a: 1
                })
            }).to.throw(Error);
            expect(function () {
                push.setApnNoteFormatter([])
            }).to.throw(Error);
        });

        it('should set formatter to the provided function', function () {
            var push = new Push();
            var formatter = function () {
            };
            push.setApnNoteFormatter(formatter);
            expect(push.apnNoteFormatter).to.be.equal(formatter);
        });

        it('should be invoked correctly when sendApn() is called', function () {
            var push = new Push();
            push.initApn(false, tmpFile, tmpFile);

            var formatter = sinon.spy();
            push.setApnNoteFormatter(formatter);

            var data = {};
            push.sendApn(['a'], data);

            sinon.assert.calledWith(formatter, sinon.match.object, data);
        });
    });

    describe('setGcmMessageFormatter', function () {

        it('should throw error for inputs that are not functions', function () {
            var push = new Push();
            expect(function () {
                push.setGcmMessageFormatter(null)
            }).to.throw(Error);
            expect(function () {
                push.setGcmMessageFormatter('abc')
            }).to.throw(Error);
            expect(function () {
                push.setGcmMessageFormatter({
                    a: 1
                })
            }).to.throw(Error);
            expect(function () {
                push.setGcmMessageFormatter([])
            }).to.throw(Error);
        });

        it('should set formatter to the provided function', function () {
            var push = new Push();
            var formatter = function () {
            };
            push.setGcmMessageFormatter(formatter);
            expect(push.gcmMessageFormatter).to.be.equal(formatter);
        });

        it('should be invoked correctly when sendGcm() is called', function () {
            var push = new Push();
            push.initGcm('GCM_KEY');

            var formatter = sinon.spy();
            push.setGcmMessageFormatter(formatter);

            var data = {};
            push.sendGcm(['a'], data);

            sinon.assert.calledWith(formatter, sinon.match.object, data);
        });
    });

    describe('sendApn()', function () {

        it('should throw error for incorrect parameters', function () {
            var push = new Push();
            push.initApn(false, tmpFile, tmpFile);
            push.setApnNoteFormatter(sinon.spy());

            expect(function () {
                push.sendApn([], null)
            }).to.throw(Error);
            expect(function () {
                push.sendApn([1, 2, 3], {})
            }).to.throw(Error);
            expect(function () {
                push.sendApn({}, {})
            }).to.throw(Error);
            expect(function () {
                push.sendApn('a', 'obj')
            }).to.throw(Error);
        });

        it('should require initApn to be called successfully', function () {
            var push = new Push();
            push.setApnNoteFormatter(sinon.spy());
            expect(function () {
                push.sendApn([], {})
            }).to.throw(Error);
        });

        it('should require setApnNoteFormatter to be called successfully', function () {
            var push = new Push();
            push.initApn(false, tmpFile, tmpFile);
            expect(function () {
                push.sendApn([], {})
            }).to.throw(Error);
        });

        it('should invoke apn connection when called correctly', function () {
            var push = new Push();
            push.initApn(false, tmpFile, tmpFile);
            push.setApnNoteFormatter(sinon.spy());

            var input = {
                devices: ['a', 'b'],
                data: {
                    a: 1
                }
            };
            push.sendApn(input.devices, input.data);
            sinon.assert.calledWith(push.apnConn.pushNotification, sinon.match.instanceOf(apn.Notification),
                input.devices);
        });

    });

    describe('sendGcm()', function () {

        it('should throw error for incorrect parameters', function () {
            var push = new Push();
            push.initGcm('GCM_KEY');
            push.setGcmMessageFormatter(sinon.spy());

            expect(function () {
                push.sendGcm([], null)
            }).to.throw(Error);
            expect(function () {
                push.sendGcm([1, 2, 3], {})
            }).to.throw(Error);
            expect(function () {
                push.sendGcm({}, {})
            }).to.throw(Error);
            expect(function () {
                push.sendGcm('a', 'obj')
            }).to.throw(Error);
        });

        it('should require initGcm to be called successfully', function () {
            var push = new Push();
            push.setGcmMessageFormatter(sinon.spy());
            expect(function () {
                push.sendGcm([], {})
            }).to.throw(Error);
        });

        it('should require setGcmMessageFormatter to be called successfully', function () {
            var push = new Push();
            push.initGcm('GCM_KEY');
            expect(function () {
                push.sendGcm([], {})
            }).to.throw(Error);
        });

        it('should invoke gcm sender correctly when called correctly', function () {
            var push = new Push();
            push.initGcm('GCM_KEY');
            push.setGcmMessageFormatter(sinon.spy());

            var input = {
                devices: ['a', 'b'],
                data: {
                    a: 1
                }
            };
            push.sendGcm(input.devices, input.data);
            sinon.assert.calledWith(push.gcmSender.send,
                sinon.match.instanceOf(gcm.Message), input.devices, sinon.match.number, sinon.match.func);
        });

        it('should process device ids in batches of 1000 to meet gcm limitations.', function () {
            var push = new Push();
            push.initGcm('GCM_KEY');
            push.setGcmMessageFormatter(sinon.spy());

            var input = {
                devices: [],
                data: {
                    a: 1
                }
            };
            input.devices = lodash.fill(new Array(2100), 'a');

            push.sendGcm(input.devices, input.data);
            sinon.assert.calledThrice(push.gcmSender.send);
        });
    });

    describe('setFeedbackHandler()', function () {

        it('should throw error for inputs that are not functions', function () {
            var push = new Push();
            expect(function () {
                push.setFeedbackHandler(null)
            }).to.throw(Error);
            expect(function () {
                push.setFeedbackHandler('abc')
            }).to.throw(Error);
            expect(function () {
                push.setFeedbackHandler({
                    a: 1
                })
            }).to.throw(Error);
            expect(function () {
                push.setFeedbackHandler([])
            }).to.throw(Error);
        });

        it('should set handler to the provided function', function () {
            var push = new Push();
            var handler = function () {
            };
            push.setFeedbackHandler(handler);
            expect(push.feedbackHandler).to.be.equal(handler);
        });

        it('should be invoked correctly when apn feedback occurs', function () {
            var push = new Push();
            push.initApn(false, tmpFile, tmpFile);

            var handler = sinon.spy();
            push.setFeedbackHandler(handler);

            var callback = push.apnFeedback.on.getCall(0).args[1];
            var devices = [{
                device: 'a'
            }, {
                device: 'b'
            }];
            callback(devices);

            sinon.assert.calledTwice(handler);
            sinon.assert.calledWith(handler, 'apn', 'deleted', devices[0].device);
            sinon.assert.calledWith(handler, 'apn', 'deleted', devices[1].device);
        });

        it('should NOT be invoked when gcm feedback is for all success', function () {
            var push = new Push();
            push.initGcm('GCM_KEY');
            push.setGcmMessageFormatter(sinon.spy());

            var handler = sinon.spy();
            push.setFeedbackHandler(handler);

            // simulate gcm API results, all ok
            var results = {
                'success': 3,
                'failure': 0,
                'canonical_ids': 0,
                'results': [
                    {
                        message_id: 'a'
                    },
                    {
                        message_id: 'b'
                    },
                    {
                        message_id: 'c'
                    }
                ]
            };

            push.gcmSender.send = sinon.stub().callsArgWith(3, null, results);

            push.sendGcm(['a', 'b'], {
                a: 1
            });

            sinon.assert.callCount(handler, 0);

        });

        it('should be invoked correctly when gcm feedback is parsed (deleted)', function () {
            var push = new Push();
            push.initGcm('GCM_KEY');
            push.setGcmMessageFormatter(sinon.spy());

            var handler = sinon.spy();
            push.setFeedbackHandler(handler);

            // simulate gcm API results, 1 deleted, 1 unavailable, 1 OK.
            var results = {
                'success': 1,
                'failure': 2,
                'canonical_ids': 0,
                'results': [
                    {
                        error: 'NotRegistered'
                    },
                    {
                        error: 'Unavailable'
                    },
                    {
                        message_id: 'c'
                    }
                ]
            };

            push.gcmSender.send = sinon.stub().callsArgWith(3, null, results);
            push.sendGcm(['a', 'b', 'c'], {
                a: 1
            });
            sinon.assert.calledWith(handler, 'gcm', 'deleted', 'a');
        });

        it('should be invoked correctly when gcm feedback is parsed (invalid)', function () {
            var push = new Push();
            push.initGcm('GCM_KEY');
            push.setGcmMessageFormatter(sinon.spy());

            var handler = sinon.spy();
            push.setFeedbackHandler(handler);

            // simulate gcm API results, 1 invalid, 1 unavailable, 1 ok.
            var results = {
                'success': 1,
                'failure': 2,
                'canonical_ids': 0,
                'results': [
                    {
                        error: 'InvalidRegistration'
                    },
                    {
                        error: 'Unavailable'
                    },
                    {
                        message_id: 'c'
                    }
                ]
            };

            push.gcmSender.send = sinon.stub().callsArgWith(3, null, results);
            push.sendGcm(['a', 'b', 'c'], {
                a: 1
            });
            sinon.assert.calledWith(handler, 'gcm', 'deleted', 'a');
        });

        it('should be invoked correctly when gcm feedback is parsed (updated)', function () {
            var push = new Push();
            push.initGcm('GCM_KEY');
            push.setGcmMessageFormatter(sinon.spy());

            var handler = sinon.spy();
            push.setFeedbackHandler(handler);

            // simulate gcm API results, 2 updated, 1 ok.
            var results = {
                'success': 3,
                'failure': 0,
                'canonical_ids': 2,
                'results': [
                    {
                        message_id: 'a',
                        registration_id: 'a1'
                    },
                    {
                        message_id: 'b',
                        registration_id: 'b1'
                    },
                    {
                        message_id: 'c'
                    }
                ]
            };

            push.gcmSender.send = sinon.stub().callsArgWith(3, null, results);
            push.sendGcm(['a', 'b', 'c'], {
                a: 1
            });
            sinon.assert.calledWith(handler, 'gcm', 'updated', 'a', 'a1');
            sinon.assert.calledWith(handler, 'gcm', 'updated', 'b', 'b1');
        });

    });

});
