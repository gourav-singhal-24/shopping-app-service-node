var config = require('config');
var Push = require('../libs/Push');
var path = require('path');

var helper =  null;

//Lazy load helpers
var helpers = function () {
  if (null == helper) {
      helper = require('../helpers');
  }
  return helper;
}

// define module
var pushNotifier = {};
module.exports = pushNotifier;

// setup push instance
var push = new Push();
var apnConf = config.get('push.apn');
var gcmConf = config.get('push.gcm');

//TODO - get apn certs and gcm key
push.initApn(apnConf.production,
    path.resolve(__dirname,'..',apnConf.cert_path),
    path.resolve(__dirname,'..',apnConf.key_path));

push.initGcm(gcmConf.gcm_key);

// enable pruning of stored push devices based on push feedback.
push.setFeedbackHandler(function(service,event,oldId,newId){
    var logger = require('../libs/appUtils').logger;
    if(event === 'deleted'){
        helpers().pushDeviceHelper.deleteDeviceId(service,oldId,function(err){
            if(err){
                console.log(err);
                //logger.error('PUSH NOTIFY','Error deleting device id from feedback.',err);
            }
        })
    }else if(event === 'updated'){
        helpers().pushDeviceHelper.updateDeviceId(service,oldId,newId,function(err){
            if(err){
                console.log(err);
                //logger.error('PUSH NOTIFY','Error updating device id from feedback.',err);
            }
        })
    }
});

// set formatter for apn push
push.setApnNoteFormatter(function(note,data){
    note.alert = data.message;
    note.payload = data.payload;
    note.retryLimit = 1; //--retry 1 time--
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // expire 1 hour from now
    note.event_type = data.event_type;
});

// set formatter for gcm push
push.setGcmMessageFormatter(function(msg,data){
    var gcm_data = {};
    gcm_data.message = data.payload;
    gcm_data.message.aps = {};
    gcm_data.message.aps.alert = data.message;
	console.log(gcm_data);
    msg.addData(gcm_data);
});

/**
 * Send a push notification to given push devices. The type of notification is to be conveyed by code,
 * and should be used to specify a corresponding message.
 * The data for the message is in the given payload.
 * @param {[Object]} userIds - an array of recipient.
 * @param {String} code - notification type.
 * @param {Object} payload - notification data.
 */
pushNotifier.sendPush = function(userIds, code, message, payload){
    var gcm_devices = [];
    var apn_devices = [];
    //TODO implement this. no callback. log errors to logger.
    helpers().pushDeviceHelper.getDevicesForUsers(userIds, function (err, devices) {
      for (var i = 0; i < devices.length; i++) {
        if (helpers().constants.PUSH_DEVICE.DEVICE_TYPES[0] == devices[i].type) {
            apn_devices.push(devices[i].device_id);
        }
        else if (helpers().constants.PUSH_DEVICE.DEVICE_TYPES[1] == devices[i].type) {
            gcm_devices.push(devices[i].device_id);
        }
      }
      var data = {payload: payload, message: message, event_type: code};
      data.payload.event_type = code;
      //console.log("Sending push to", userIds,apn_devices, gcm_devices, data);
      push.sendApn(apn_devices, data);
      push.sendGcm(gcm_devices, data);
    });
};

/**
 * Function to resolve notification type and data from given code and payload.
 * @param {String} code - notification type.
 * @param {Object} payload - notification data.
 */
function resolvePushContent(code,payload){
    //TODO implement this
}
